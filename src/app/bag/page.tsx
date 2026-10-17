import React from 'react';
import { CartClient } from '../cart/CartClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Bag // Terminal — KAAZE',
  description: 'Review allocated pieces in your KAAZE dispatch bag.',
};

export default function BagPage() {
  return <CartClient />;
}
