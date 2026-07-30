export function getWhatsAppNumber() {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567").replace(
    /\D/g,
    ""
  );
}

export function whatsappChatUrl(prefill?: string) {
  const n = getWhatsAppNumber();
  const text = encodeURIComponent(
    prefill || "Hi Karachi Toy Shop! I have a question about toys / my order."
  );
  return `https://wa.me/${n}?text=${text}`;
}

export function whatsappOrderUrl(orderNumber: string, total: number) {
  return whatsappChatUrl(
    `Hi Karachi Toy Shop! I just placed order ${orderNumber} (total PKR ${total}). Please confirm.`
  );
}
