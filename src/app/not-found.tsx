import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-display text-7xl font-semibold text-coral">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Toy not found</h1>
      <p className="mt-2 text-muted">
        That page wandered off the play mat.
      </p>
      <Link href="/shop" className="btn-primary mt-8 inline-flex">
        Back to shop
      </Link>
    </div>
  );
}
