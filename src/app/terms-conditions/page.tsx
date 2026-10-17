import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — KAAZE',
  description:
    'Purchase terms, product sourcing, pricing, shipping, no returns or exchanges, and customer agreements.',
};

export default function TermsConditionsPage() {
  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* Top Meta Bar */}
      <div className="w-full bg-surface-container-lowest px-margin md:px-margin-desktop py-space-sm border-b border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm font-mono">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">
              [ CONTRACT PROTOCOL // TC-2026 ]
            </span>
            <span className="hidden sm:inline text-outline-variant">|</span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
              PURCHASE CONDITIONS &amp; AGREEMENTS
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
              [ LEGAL PROTOCOL ]
            </span>
            <h1 className="font-display-xl text-display-xl-mobile md:text-display-xl uppercase tracking-tight text-primary leading-none m-0 font-sans font-bold">
              TERMS &amp; CONDITIONS
            </h1>
            <p className="font-headline-md text-headline-md text-primary uppercase tracking-wide mt-3 font-sans font-semibold">
              PURCHASE TERMS, PRODUCT SOURCING &amp; CUSTOMER AGREEMENTS.
            </p>
          </div>

          {/* Numbered Sections Grid */}
          <div className="space-y-space-md">
            {/* 01 // PRODUCT SOURCING & AVAILABILITY */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  01 // PRODUCT SOURCING &amp; AVAILABILITY
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                KAAZE sources fashion and lifestyle products from external brands, suppliers, and sellers. Product availability, specifications, and prices may change depending on supplier availability. Orders are subject to confirmation.
              </p>
            </section>

            {/* 02 // PRICING & PAYMENTS */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  02 // PRICING &amp; PAYMENTS
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                All prices are displayed in Indian Rupees (INR ₹), unless stated otherwise. Applicable shipping charges and taxes will be shown where required before checkout. Orders are processed after successful payment confirmation.
              </p>
            </section>

            {/* 03 // NO RETURNS OR EXCHANGES */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  03 // NO RETURNS OR EXCHANGES
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                Please review product descriptions, sizes, specifications, and images carefully before purchasing. KAAZE follows a no-return and no-exchange policy, subject to applicable consumer-protection laws and remedies for eligible defective, damaged, counterfeit, or incorrectly supplied products.
              </p>
            </section>

            {/* 04 // SHIPPING & DELIVERY */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  04 // SHIPPING &amp; DELIVERY
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                Orders may be fulfilled by third-party suppliers or courier partners. Delivery estimates are indicative and may vary due to location, availability, or courier delays.
              </p>
            </section>

            {/* 05 // PRODUCT INFORMATION */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  05 // PRODUCT INFORMATION
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                Product images and descriptions are provided to help customers make informed decisions. Actual colours or appearance may vary slightly due to lighting, photography, or screen settings.
              </p>
            </section>

            {/* 06 // THIRD-PARTY SERVICES */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  06 // THIRD-PARTY SERVICES
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                Payments, shipping, and fulfilment may involve external service providers. Their services are subject to their applicable terms and policies. This does not remove any obligations KAAZE has under applicable law.
              </p>
            </section>

            {/* 07 // CONTACT & SUPPORT */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  07 // CONTACT &amp; SUPPORT
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                For questions about products, orders, or these terms, contact KAAZE through the support details provided on our website.
              </p>
            </section>
          </div>

          {/* Navigation Links */}
          <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-surface-container font-mono font-label-sm text-label-sm">
            <Link
              href="/privacy-policy"
              className="text-primary hover:underline underline-offset-4 uppercase font-semibold"
            >
              ← PRIVACY POLICY
            </Link>
            <Link
              href="/shipping-returns"
              className="text-primary hover:underline underline-offset-4 uppercase font-semibold"
            >
              SHIPPING &amp; LOGISTICS →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
