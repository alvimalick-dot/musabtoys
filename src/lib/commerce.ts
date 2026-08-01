/** Shared commerce constants — keep checkout UI & API in sync */
export const FREE_SHIPPING_THRESHOLD = 3000;
export const SHIPPING_FEE = 250;

/**
 * Shipping rule:
 * - Subtotal >= FREE_SHIPPING_THRESHOLD (3000)  → free shipping
 * - Subtotal  < FREE_SHIPPING_THRESHOLD          → flat SHIPPING_FEE (250)
 * - If a coupon is applied (hasCoupon = true)    → always charged SHIPPING_FEE (250)
 */
export function calcShipping(
  subtotal: number,
  hasCoupon = false
): number {
  if (subtotal <= 0) return 0;
  if (hasCoupon) return SHIPPING_FEE;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
