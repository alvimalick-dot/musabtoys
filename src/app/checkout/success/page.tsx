import type { Metadata } from "next";
import { SuccessClient } from "@/components/checkout/SuccessClient";

export const metadata: Metadata = {
  title: "Order placed",
};

type Props = { searchParams: Promise<{ order?: string; total?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order, total } = await searchParams;
  return <SuccessClient order={order} total={total} />;
}
