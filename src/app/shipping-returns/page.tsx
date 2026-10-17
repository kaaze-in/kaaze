import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Logistics — KAAZE',
  description:
    'Third-party fulfilment. Clear policies. Delivery timelines, all sales final policy, and order support.',
};

export default function ShippingReturnsPage() {
  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* Top Meta Bar */}
      <div className="w-full bg-surface-container-lowest px-margin md:px-margin-desktop py-space-sm border-b border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm font-mono">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">
              [ LOGISTICAL PROTOCOLS // POLICY DIRECTIVE ]
            </span>
            <span className="hidden sm:inline text-outline-variant">|</span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
              FULFILMENT &amp; ORDERS
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline uppercase font-mono">
            KAAZE ONLINE
          </span>
        </div>
      </div>

      <div className="w-full px-margin md:px-margin-desktop py-space-lg md:py-space-xl">
        <div className="max-w-4xl mx-auto flex flex-col space-y-space-xl">
          {/* Header */}
          <div className="flex flex-col space-y-space-xs border-b border-surface-container pb-space-lg font-mono">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
              [ FULFILMENT PROTOCOL ]
            </span>
            <h1 className="font-display-xl text-display-xl-mobile md:text-display-xl uppercase tracking-tight text-primary leading-none m-0 font-sans font-bold">
              SHIPPING &amp; LOGISTICS
            </h1>
            <p className="font-headline-md text-headline-md text-primary uppercase tracking-wide mt-3 font-sans font-semibold">
              THIRD-PARTY FULFILMENT. CLEAR POLICIES.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed font-sans max-w-3xl mt-2">
              KAAZE sources products from external brands and suppliers. Order processing, packaging, shipping, and delivery may be managed by third-party sellers or logistics partners.
            </p>
          </div>

          {/* Numbered Sections Grid */}
          <div className="space-y-space-md">
            {/* 01 // SHIPPING & DELIVERY */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  01 // SHIPPING &amp; DELIVERY
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                Delivery timelines and shipping charges vary by product and supplier. Estimated delivery details will be shared where available.
              </p>
            </section>

            {/* 02 // ALL SALES ARE FINAL */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  02 // ALL SALES ARE FINAL
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                <strong className="text-primary font-bold block mb-1">
                  No returns. No exchanges.
                </strong>
                Please review product descriptions, specifications, sizes, and details carefully before placing your order.
              </p>
            </section>

            {/* 03 // THIRD-PARTY FULFILMENT */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  03 // THIRD-PARTY FULFILMENT
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                KAAZE does not manufacture products or directly control every aspect of third-party shipping. Delays caused by suppliers or courier partners may occur.
              </p>
            </section>

            {/* 04 // ORDER SUPPORT */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  04 // ORDER SUPPORT
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                For order-related questions, contact KAAZE support. We will assist with enquiries where possible.
              </p>
            </section>
          </div>

          {/* Statement Banner */}
          <div className="p-space-lg bg-surface-container-low border border-surface-container text-center">
            <span className="font-headline-md text-headline-md text-primary uppercase font-bold tracking-wider font-sans block">
              CHOOSE CAREFULLY. SHOP WITH CONFIDENCE.
            </span>
          </div>

          {/* Navigation Links */}
          <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-surface-container font-mono font-label-sm text-label-sm">
            <Link
              href="/shop"
              className="text-primary hover:underline underline-offset-4 uppercase font-semibold"
            >
              ← EXPLORE CATALOGUE
            </Link>
            <Link
              href="/contact"
              className="text-primary hover:underline underline-offset-4 uppercase font-semibold"
            >
              CONTACT ORDER SUPPORT →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
