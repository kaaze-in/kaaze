import React, { Suspense } from 'react';
import { ShopClient } from '../shop/ShopClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections // Directory — KAAZE',
  description: 'KAAZE Collections and Category Directory.',
};

export default function CollectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-space-xl text-center font-label-md text-outline uppercase tracking-widest">
          [ RETRIEVING ARCHIVE DIRECTORY... ]
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
