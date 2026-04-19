/**
 * Aligns cart/checkout totals with backend `orderController.createOrder`:
 * total = items + sum(per-line product shipping, once per cart line) + platformFee + optional card % on items only.
 * Per-line shipping is the product's shipping fee once per line (not multiplied by quantity).
 */

export const CARD_FEE_PERCENT = 0.05;

export type PaymentMethodLike = 'stripe' | 'cod';

export function computeOrderAmounts(
  cartItems: any[],
  platformFee: number,
  paymentMethod: PaymentMethodLike
) {
  let itemsSubtotal = 0;
  let shippingSum = 0;
  const perLine: Array<{
    key: string;
    name: string;
    shipping: number;
    notes?: string;
    shippingTime?: string;
  }> = [];

  for (const item of cartItems) {
    const product = item.product || {};
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price =
      typeof item.productPrice === 'number' && item.productPrice >= 0
        ? item.productPrice
        : typeof product.price === 'number'
          ? product.price
          : 0;
    itemsSubtotal += Math.round(price * qty);
    const unitShip = Math.max(0, Number(product.shippingFees) || 0);
    const lineShip = Math.round(unitShip);
    shippingSum += lineShip;
    const name = product.name || item.productName || 'Item';
    const notes = typeof product.notes === 'string' ? product.notes.trim() : '';
    const shippingTime = typeof product.shippingTime === 'string' ? product.shippingTime.trim() : '';
    perLine.push({
      key: String(item._id || item.id || name),
      name,
      shipping: lineShip,
      notes: notes || undefined,
      shippingTime: shippingTime || undefined,
    });
  }

  const subtotalRounded = Math.round(itemsSubtotal);
  const pf = Math.max(0, Math.round(platformFee || 0));
  const cardFee =
    paymentMethod === 'stripe' ? Math.round(subtotalRounded * CARD_FEE_PERCENT) : 0;
  const total = subtotalRounded + shippingSum + pf + cardFee;

  return {
    itemsSubtotal: subtotalRounded,
    shippingSum,
    platformFee: pf,
    cardFee,
    total,
    perLine,
  };
}
