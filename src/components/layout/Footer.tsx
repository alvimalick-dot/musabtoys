import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-[#1a1530] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold">Karachi Toy Shop</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Thousands of toys for every age — from PKR 100 finds to premium
            playsets. Cash on Delivery across Karachi and beyond.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sun">
            Explore
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/80">
            <Link href="/shop" className="hover:text-white">
              Shop catalog
            </Link>
            <Link href="/track" className="hover:text-white">
              Track order
            </Link>
            <Link href="/faq" className="hover:text-white">
              FAQ & returns
            </Link>
            <Link href="/account" className="hover:text-white">
              My account
            </Link>
            <Link href="/checkout" className="hover:text-white">
              Checkout
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sun">
            Payments
          </p>
          <p className="mt-4 text-sm text-white/80">
            Cash on Delivery (primary). Online wallets coming soon.
          </p>
          <p className="mt-6 text-xs text-white/40">
            © {new Date().getFullYear()} Karachi Toy Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
