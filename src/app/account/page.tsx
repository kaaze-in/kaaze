import React from 'react';
import { AccountClient } from './AccountClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Account — KAAZE',
  description: 'Manage your KAAZE customer account, order history, saved cart items, and shipping address.',
};

export default function AccountPage() {
  return <AccountClient />;
}
