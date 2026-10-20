import React, { Suspense } from 'react';
import { ShopClient } from './ShopClient';
import { getProducts } from '@/lib/shopify';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catalogue // Category Directory — KAAZE',
  description:
    'Explore the complete KAAZE directory: Clothing, Shoes, Watches, and Accessories. Architectural brutalism in everyday staples.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage() {
  const initialProducts = await getProducts();

  return (
    <Suspense
      fallback={
        <div className="w-full py-space-xl text-center font-label-md text-outline uppercase tracking-widest">
          [ RETRIEVING ARCHIVE DIRECTORY... ]
        </div>
      }
    >
      <ShopClient initialProducts={initialProducts} />
    </Suspense>
  );
}
