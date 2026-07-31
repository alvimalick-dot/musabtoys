import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * JazzCash / PayFast IPN webhook.
 * Verifies HMAC signature, then sets Order.paymentStatus = "paid".
 * Never marks paid from a browser redirect alone.
 */
export async function POST(req: NextRequest) {
  // Enabled check
  if (process.env.ENABLE_ONLINE_PAYMENTS !== "true") {
    return NextResponse.json(
      { error: "Online payments are not enabled" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();

    // Detect gateway from payload structure
    const gateway = body.pp_ResponseCode !== undefined ? "jazzcash" :
                    body.pf_payment_id !== undefined ? "payfast" : "unknown";

    // Extract order number from merchant reference
    const orderRef = body.pp_ReferenceNumber || body.pf_custom_str1 || body.orderNumber || "";
    if (!orderRef) {
      return NextResponse.json(
        { error: "Could not identify order" },
        { status: 400 }
      );
    }

    let verified = false;

    if (gateway === "jazzcash" && process.env.JAZZCASH_INTEGRITY_SALT) {
      // JazzCash HMAC verification
      const pp_SecureHash = body.pp_SecureHash || "";
      const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
      const hashString = `${body.pp_Amount}&${body.pp_AuthCode}&${body.pp_BankID}&${body.pp_BlockType}&${body.pp_Currency}&${body.pp_ResponseCode}&${body.pp_RetreivalReferenceNo}&${body.pp_SettlementDate}&${body.pp_TxnCurrency}&${body.pp_TxnDateTime}&${body.pp_TxnRefNo}&${body.pp_Version}&${body.ppmpf_1}&${body.ppmpf_2}&${body.ppmpf_3}&${body.ppmpf_4}&${body.ppmpf_5}`;
      const computedHash = crypto
        .createHmac("sha256", integritySalt)
        .update(hashString)
        .digest("hex")
        .toUpperCase();
      if (computedHash === pp_SecureHash.toUpperCase()) {
        verified = body.pp_ResponseCode === "000";
      }
    } else if (gateway === "payfast" && process.env.PAYFAST_PASSPHRASE) {
      // PayFast ITN verification: echo back
      const verificationRes = await fetch("https://www.payfast.co.za/eng/process/query", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ...body }).toString(),
      });
      const verificationBody = await verificationRes.text();
      verified = verificationBody === "VALID" && body.pf_payment_status === "COMPLETE";
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      );
    }

    await connectDB();
    const order = await Order.findOneAndUpdate(
      { orderNumber: orderRef.trim().toUpperCase() },
      { paymentStatus: "paid" },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      received: true,
      verified: true,
      order: order.orderNumber,
      paymentStatus: "paid",
    });
  } catch (error) {
    console.error("Webhook error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    note: "Point JazzCash/PayFast IPN URLs here after enabling ENABLE_ONLINE_PAYMENTS=true",
  });
}
