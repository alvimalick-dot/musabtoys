import { connectDB } from "@/lib/mongodb";
import { StockAlert } from "@/models/StockAlert";
import { sendEmail } from "@/lib/notify";
import { absoluteUrl } from "@/lib/seo";

/**
 * Notify every customer who signed up for a back-in-stock alert on this
 * product, then mark the alerts as `notified: true` so they are never
 * emailed twice for the same restock event.
 *
 * Email is the only reachable channel here — we intentionally do NOT
 * auto-send WhatsApp messages (that requires the paid WhatsApp Business API
 * with approved templates). Phone numbers remain on the record for the
 * shop's own reference / deduping.
 *
 * Designed to be called AFTER the product's stock has been updated to > 0.
 * Non-blocking and best-effort: failures are logged, never thrown.
 */
export async function notifyRestockAlerts(opts: {
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
}) {
  try {
    await connectDB();

    const alerts = await StockAlert.find({
      productId: opts.productId,
      notified: false,
    }).lean();

    if (alerts.length === 0) return { notified: 0 };

    const productUrl = absoluteUrl(`/product/${opts.productSlug}`);
    const subject = `Back in stock! ${opts.productName} is available again 🧸`;
    const text = `Good news!\n\nThe toy you asked about is back in stock:\n\n${opts.productName}\nPKR ${opts.price}\n\nShop it now: ${productUrl}\n\n— Karachi Toy Shop`;

    let sent = 0;
    for (const alert of alerts) {
      if (!alert.email) continue;
      try {
        const ok = await sendEmail({
          to: alert.email,
          subject,
          text,
        });
        if (ok) sent += 1;
      } catch (err) {
        console.error("Restock email failed for", alert.email, err);
      }
    }

    // Mark ALL alerts as notified (not just the successfully emailed ones)
    // so a permanently failing address can't block re-notifying others on
    // the next restock cycle.
    await StockAlert.updateMany(
      { productId: opts.productId, notified: false },
      { notified: true }
    );

    return { notified: sent };
  } catch (error) {
    console.error("notifyRestockAlerts failed:", error);
    return { notified: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

