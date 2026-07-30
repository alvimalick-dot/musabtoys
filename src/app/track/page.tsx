import type { Metadata } from "next";
import { TrackForm } from "@/components/track/TrackForm";

export const metadata: Metadata = {
  title: "Track order",
  description: "Track your Karachi Toy Shop order with order number and phone.",
};

type Props = { searchParams: Promise<{ order?: string }> };

export default async function TrackPage({ searchParams }: Props) {
  const { order } = await searchParams;
  return <TrackForm initialOrder={order || ""} />;
}
