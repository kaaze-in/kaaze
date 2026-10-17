import { NextResponse } from 'next/server';
import { getProducts, getShopifyDomain, isShopifyConfigured } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const products = await getProducts(category);

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      isLiveShopify: isShopifyConfigured,
      domain: getShopifyDomain(),
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
