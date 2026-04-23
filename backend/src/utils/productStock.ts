import type { IProduct } from '../models/Product';

type RawVariation = {
  size?: string;
  color?: string;
  stock?: number;
  outOfStock?: boolean;
};

const normalize = (value?: string): string => (value || '').trim().toLowerCase();

const toStockNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.max(0, value);
};

const getVariationAvailableStock = (
  variation: RawVariation,
  fallbackStock: number
): number | null => {
  const numericStock = toStockNumber(variation?.stock);
  if (numericStock !== null) return numericStock;

  if (variation?.outOfStock === true) return 0;
  if (variation?.outOfStock === false) return Math.max(0, fallbackStock);

  return null;
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
  const fallbackStock = Math.max(0, Number(product.stock) || 0);

  const normalizedSize = normalize(size);
  const normalizedColor = normalize(color);

  if (!normalizedSize && !normalizedColor) return -1;

  if (normalizedSize && normalizedColor) {
    const exactIndex = variations.findIndex((variation) => {
      return (
        normalize(variation.size) === normalizedSize &&
        normalize(variation.color) === normalizedColor &&
        getVariationAvailableStock(variation, fallbackStock) !== null
      );
    });
    if (exactIndex !== -1) return exactIndex;
  }

  if (normalizedSize) {
    const sizeOnlyIndex = variations.findIndex((variation) => {
      return (
        normalize(variation.size) === normalizedSize &&
        getVariationAvailableStock(variation, fallbackStock) !== null
      );
    });
    if (sizeOnlyIndex !== -1) return sizeOnlyIndex;
  }

  if (normalizedColor) {
    const colorOnlyIndex = variations.findIndex((variation) => {
      return (
        normalize(variation.color) === normalizedColor &&
        getVariationAvailableStock(variation, fallbackStock) !== null
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
  const fallbackStock = Math.max(0, Number(product.stock) || 0);
  const variationIndex = findVariationIndex(product, size, color);
  if (variationIndex !== -1) {
    const variation = getVariations(product)[variationIndex];
    const variationStock = getVariationAvailableStock(variation, fallbackStock);
    if (variationStock === null) return fallbackStock;
    return Math.min(fallbackStock, variationStock);
  }

  return fallbackStock;
};

export const decrementStockForSelection = async (
  product: IProduct,
  quantity: number,
  size?: string,
  color?: string
): Promise<void> => {
  const safeQuantity = Math.max(0, Number(quantity) || 0);
  if (safeQuantity <= 0) return;

  const previousProductStock = Math.max(0, Number(product.stock) || 0);
  product.stock = Math.max(0, previousProductStock - safeQuantity);

  const variationIndex = findVariationIndex(product, size, color);
  if (variationIndex !== -1) {
    const variations = getVariations(product);
    const variation = variations[variationIndex];
    const variationStock = getVariationAvailableStock(variation, previousProductStock) ?? 0;
    variation.stock = Math.max(0, variationStock - safeQuantity);
    product.set('variations', variations);
  }

  await product.save();
};
