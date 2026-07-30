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
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <MessageCircle className="h-7 w-7" />
    </motion.a>
  );
}
