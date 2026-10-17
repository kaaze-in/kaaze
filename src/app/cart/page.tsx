import React from 'react';
import { CartClient } from './CartClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Bag // Terminal — KAAZE',
  description: 'Review allocated pieces in your KAAZE dispatch bag. Architectural precision in everyday staples.',
};

export default function CartPage() {
  return <CartClient />;
}
