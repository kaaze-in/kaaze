import { NextResponse } from 'next/server';
import { createShopifyCheckout, getProductByHandle, getShopifyDomain } from '@/lib/shopify';
import { CartItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: CartItem[] = body.items || [];

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot checkout with an empty cart.' },
        { status: 400 }
      );
    }

    // Resolve variant IDs for each line item
    const checkoutLines: { variantId: string; quantity: number }[] = [];

    for (const item of items) {
      let resolvedVariantId = item.variantId;

      // Ensure resolvedVariantId is a ProductVariant, not a Product
      if (resolvedVariantId && resolvedVariantId.includes('gid://shopify/Product/') && !resolvedVariantId.includes('ProductVariant')) {
        resolvedVariantId = undefined;
      }

      // If variantId is missing or invalid, resolve from Shopify product data
      if (!resolvedVariantId || resolvedVariantId.startsWith('kz-') || resolvedVariantId.includes('CartLine')) {
        if (item.handle) {
          const product = await getProductByHandle(item.handle);
          if (product && product.variants && product.variants.length > 0) {
            // Find variant matching size and color if possible
            const matching = product.variants.find((v) => {
              const matchesSize =
                !item.selectedSize ||
                v.selectedOptions?.some(
                  (o) => o.name.toLowerCase() === 'size' && o.value.toLowerCase() === item.selectedSize.toLowerCase()
                ) ||
                v.title.toLowerCase().includes(item.selectedSize.toLowerCase());

              const matchesColor =
                !item.selectedColor ||
                v.selectedOptions?.some(
                  (o) =>
                    (o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour') &&
                    o.value.toLowerCase() === item.selectedColor.toLowerCase()
                ) ||
                v.title.toLowerCase().includes(item.selectedColor.toLowerCase());

              return matchesSize && matchesColor;
            });

            resolvedVariantId = matching?.id || product.variants[0].id;
          }
        }
      }

      // Only push valid Shopify variants to checkout (exclude unresolvable mock/demo IDs)
      if (resolvedVariantId && (resolvedVariantId.includes('ProductVariant') || /^\d+$/.test(resolvedVariantId))) {
        checkoutLines.push({
          variantId: resolvedVariantId,
          quantity: Math.max(1, item.quantity || 1),
        });
      }
    }

    if (checkoutLines.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid Shopify products found in cart to checkout.' },
        { status: 400 }
      );
    }

    const { checkoutUrl, error } = await createShopifyCheckout(checkoutLines);

    return NextResponse.json({
      success: true,
      checkoutUrl,
      error,
      domain: getShopifyDomain(),
    });
  } catch (error) {
    console.error('Shopify Checkout Route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || 'Failed to initiate checkout',
      },
      { status: 500 }
    );
  }
}
