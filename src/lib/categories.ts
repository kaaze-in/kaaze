import { Product } from '@/types';

/**
 * Checks whether a product belongs to a given category or collection handle.
 * Uses actual Shopify collection membership as the sole source of truth.
 */
export function productMatchesCategory(product: Product, category: string): boolean {
  if (!category || category === 'all') return true;
  const target = category.toLowerCase().trim();

  // 1. Direct collection handles match: SOLE source of truth for Shopify products
  if (Array.isArray(product.collectionHandles) && product.collectionHandles.length > 0) {
    return product.collectionHandles.some((h) => {
      const lower = h.toLowerCase().trim();
      if (lower === target) return true;
      // Handle standard handle synonyms
      if (target === 'clothing' && (lower === 'clothes' || lower === 'apparel')) return true;
      if (target === 'shoes' && (lower === 'shoe' || lower === 'footwear')) return true;
      if (target === 'watches' && (lower === 'watch' || lower === 'timepieces')) return true;
      if (target === 'accessories' && (lower === 'accessory' || lower === 'hardware')) return true;
      return false;
    });
  }

  // 2. Fallback only when collectionHandles are absent (e.g. offline dev / mock data)
  if (product.category && product.category.toLowerCase() === target) {
    return true;
  }

  return false;
}
