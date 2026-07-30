/** Shared commerce constants — keep checkout UI & API in sync */
export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 250;

export function calcShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
