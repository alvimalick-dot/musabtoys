import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * JazzCash / PayFast IPN placeholder.
 * Implement HMAC verification, then set Order.paymentStatus = "paid".
 * Never mark paid from a browser redirect alone.
 */
export async function POST() {
  if (process.env.ENABLE_ONLINE_PAYMENTS !== "true") {
    return NextResponse.json(
      { error: "Online payments are not enabled" },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      received: true,
      message:
        "Webhook stub — signature verification not implemented. Order NOT marked paid.",
    },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json({
    status: "ready-for-integration",
    note: "Point JazzCash/PayFast IPN URLs here after enabling ENABLE_ONLINE_PAYMENTS=true",
  });
}
