import type { Metadata } from "next";
import { TrackForm } from "@/components/track/TrackForm";

export const metadata: Metadata = {
  title: "Track Your Order | Karachi Toys",
  description: "Track your Karachi Toys order using your order number and email address.",
  alternates: { canonical: "/track" },
  robots: { index: true, follow: true },
};

type Props = { searchParams: Promise<{ order?: string; email?: string }> };

export default async function TrackPage({ searchParams }: Props) {
  const { order, email } = await searchParams;
  return <TrackForm initialOrder={order || ""} initialEmail={email || ""} />;
}
