import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import {
  BRAND_ADDRESS,
  BRAND_LOCATION_NOTE,
  BRAND_MAPS_URL,
  BRAND_PHONE,
  BRAND_PHONE_DISPLAY,
} from "@/lib/seo";
import { SocialLinks } from "@/components/ui/SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-[#1a1530] text-white">
      {/* Changed py-14 to pt-8 pb-28 (and sm:pt-10) to reduce the inner top space */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-8 pb-28 sm:px-6 sm:pt-10 md:grid-cols-3 md:pb-14">
        <div>
          <p className="font-display text-2xl font-semibold">Karachi Toys</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Thousands of toys for every age — from PKR 100 finds to premium
            playsets. Cash on Delivery across Pakistan.
          </p>
          <a
            href={BRAND_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="group mt-4 flex items-start gap-2 text-sm text-white/80 transition hover:text-white"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sun" />
            <span>
              {BRAND_ADDRESS}
              <span className="block text-xs text-white/50">
                {BRAND_LOCATION_NOTE}
              </span>
            </span>
          </a>
          <a
            href={"tel:" + BRAND_PHONE.replace(/\s+/g, "")}
            className="mt-3 flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
          >
            <Phone className="h-4 w-4 shrink-0 text-sun" />
            {BRAND_PHONE_DISPLAY}
          </a>
          <div className="mt-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sun">
              Follow us
            </p>
            <SocialLinks className="mt-3" />
          </div>
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