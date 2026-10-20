import React from 'react';
import { CartClient } from './CartClient';
import { getProducts } from '@/lib/shopify';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Bag // Terminal — KAAZE',
  description: 'Review allocated pieces in your KAAZE dispatch bag. Architectural precision in everyday staples.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CartPage() {
  const liveProducts = await getProducts();
  return <CartClient recommendedProducts={liveProducts.slice(0, 4)} />;
}
