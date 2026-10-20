import { NextResponse } from 'next/server';
import {
  getProducts,
  getShopifyDomain,
  checkShopifyConfigured,
  shopifyFetch,
  PRODUCTS_GRAPHQL_QUERY,
  transformShopifyProduct,
  productMatchesCategory,
} from '@/lib/shopify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const isLive = checkShopifyConfigured();
    const domain = getShopifyDomain();

    if (isLive) {
      const res = await shopifyFetch<{
        products: { edges: { node: unknown }[] };
      }>({
        query: PRODUCTS_GRAPHQL_QUERY,
      });

      if (res.error) {
        console.error('Shopify API query error:', res.error);
        return NextResponse.json(
          {
            success: false,
            error: res.error,
            isLiveShopify: false,
            domain,
          },
          { status: 502 }
        );
      }

      let products = (res.data?.products?.edges || []).map((e) => transformShopifyProduct(e.node));
      if (category && category !== 'all') {
        products = products.filter((p) => productMatchesCategory(p, category));
      }

      return NextResponse.json({
        success: true,
        products,
        count: products.length,
        isLiveShopify: true,
        domain,
      });
    }

    // Graceful fallback when Shopify Storefront is not configured (e.g., local development)
    const products = await getProducts(category);

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      isLiveShopify: false,
      domain,
    });
  } catch (error) {
    console.error('Error fetching products API:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || 'Failed to retrieve products',
      },
      { status: 500 }
    );
  }
}

