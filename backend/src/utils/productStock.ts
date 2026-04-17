import type { IProduct } from '../models/Product';

type RawVariation = {
  size?: string;
  color?: string;
  stock?: number;
};

const normalize = (value?: string): string => (value || '').trim().toLowerCase();

const toStockNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.max(0, value);
};

const getVariations = (product: IProduct): RawVariation[] => {
  if (!Array.isArray(product.variations)) return [];
  return product.variations as RawVariation[];
};

export const getSelectionLabel = (size?: string, color?: string): string => {
  if (size && color) return `size ${size} (${color})`;
  if (size) return `size ${size}`;
  if (color) return `color ${color}`;
  return 'this product';
};

const findVariationIndex = (
  product: IProduct,
  size?: string,
  color?: string
): number => {
  const variations = getVariations(product);
  if (variations.length === 0) return -1;

  const normalizedSize = normalize(size);
  const normalizedColor = normalize(color);

  if (!normalizedSize && !normalizedColor) return -1;

  if (normalizedSize && normalizedColor) {
    const exactIndex = variations.findIndex((variation) => {
      return (
        normalize(variation.size) === normalizedSize &&
        normalize(variation.color) === normalizedColor &&
        toStockNumber(variation.stock) !== null
      );
    });
    if (exactIndex !== -1) return exactIndex;
  }

  if (normalizedSize) {
    const sizeOnlyIndex = variations.findIndex((variation) => {
      return (
        normalize(variation.size) === normalizedSize &&
        toStockNumber(variation.stock) !== null
      );
    });
    if (sizeOnlyIndex !== -1) return sizeOnlyIndex;
  }

  if (normalizedColor) {
    const colorOnlyIndex = variations.findIndex((variation) => {
      return (
        normalize(variation.color) === normalizedColor &&
        toStockNumber(variation.stock) !== null
      );
    });
    if (colorOnlyIndex !== -1) return colorOnlyIndex;
  }

  return -1;
};

export const getAvailableStockForSelection = (
  product: IProduct,
  size?: string,
  color?: string
): number => {
  const variationIndex = findVariationIndex(product, size, color);
  if (variationIndex !== -1) {
    const variationStock = toStockNumber(getVariations(product)[variationIndex]?.stock);
    return variationStock ?? 0;
  }

  return Math.max(0, product.stock ?? 0);
};

export const decrementStockForSelection = async (
  product: IProduct,
  quantity: number,
  size?: string,
  color?: string
): Promise<void> => {
  const safeQuantity = Math.max(0, Number(quantity) || 0);
  if (safeQuantity <= 0) return;

  product.stock = Math.max(0, (product.stock ?? 0) - safeQuantity);

  const variationIndex = findVariationIndex(product, size, color);
  if (variationIndex !== -1) {
    const variations = getVariations(product);
    const variation = variations[variationIndex];
    const variationStock = toStockNumber(variation.stock) ?? 0;
    variation.stock = Math.max(0, variationStock - safeQuantity);
    product.set('variations', variations);
  }

  await product.save();
};
