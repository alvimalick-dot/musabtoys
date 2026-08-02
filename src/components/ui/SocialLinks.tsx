import { MessageCircle } from "lucide-react";
import { BRAND_SOCIAL } from "@/lib/seo";
import { whatsappChatUrl } from "@/lib/whatsapp";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function SocialLinks({ className = "" }: { className?: string }) {
  const items = [
    {
      label: "Instagram",
      href: BRAND_SOCIAL.instagram,
      icon: <InstagramIcon className="h-[18px] w-[18px]" />,
    },
    {
      label: "TikTok",
      href: BRAND_SOCIAL.tiktok,
      icon: <TikTokIcon className="h-[18px] w-[18px]" />,
    },
    {
      label: "WhatsApp",
      href: whatsappChatUrl(),
      icon: <MessageCircle className="h-[18px] w-[18px]" />,
    },
  ];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={item.label}
          title={item.label}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white hover:text-ink hover:ring-white"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

