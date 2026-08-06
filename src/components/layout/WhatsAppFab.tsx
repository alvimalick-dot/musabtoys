"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappChatUrl } from "@/lib/whatsapp";

export function WhatsAppFab() {
  return (
<motion.a
      href={whatsappChatUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[max(5.25rem,calc(env(safe-area-inset-bottom)+4rem))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 lg:bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <MessageCircle className="h-7 w-7" />
    </motion.a>
  );
}
