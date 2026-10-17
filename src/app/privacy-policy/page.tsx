import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PurchaseTermsSection } from './PurchaseTermsSection';

export const metadata: Metadata = {
  title: 'Privacy Policy — KAAZE',
  description:
    'Your data. Your privacy. Clear terms. Customer information, checkout handling, cookies, and privacy rights.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* Top Meta Bar */}
      <div className="w-full bg-surface-container-lowest px-margin md:px-margin-desktop py-space-sm border-b border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm font-mono">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">
              [ PRIVACY DIRECTIVE // SEC-V04 ]
            </span>
            <span className="hidden sm:inline text-outline-variant">|</span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
              DATA RETENTION &amp; SECURITY
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
              PRIVACY POLICY.
            </h1>
            <p className="font-headline-md text-headline-md text-primary uppercase tracking-wide mt-3 font-sans font-semibold">
              YOUR DATA. YOUR PRIVACY. CLEAR TERMS.
            </p>
          </div>

          {/* Numbered Sections */}
          <div className="space-y-space-md">
            {/* 01 // CUSTOMER INFORMATION */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  01 // CUSTOMER INFORMATION
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                We may collect information such as your name, contact details, shipping address, and order information to process purchases and provide customer support.
              </p>
            </section>

            {/* 02 // PAYMENTS & CHECKOUT */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  02 // PAYMENTS &amp; CHECKOUT
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                Payments are processed through the payment providers available at checkout. KAAZE does not intend to store your full payment card details.
              </p>
            </section>

            {/* 03 // COOKIES & WEBSITE DATA */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  03 // COOKIES &amp; WEBSITE DATA
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                Our website may use cookies and similar technologies to support essential functions, maintain your shopping session, and improve your browsing experience.
              </p>
            </section>

            {/* 04 // THIRD-PARTY SERVICES */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  04 // THIRD-PARTY SERVICES
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                As KAAZE sources products from external suppliers, order information may be shared with relevant fulfilment, shipping, and payment partners when necessary to complete your order.
              </p>
            </section>

            {/* 05 // YOUR PRIVACY RIGHTS */}
            <section className="bg-surface-container-low border border-surface-container p-space-md md:p-space-lg flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-2 font-mono">
                <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
                  05 // YOUR PRIVACY RIGHTS
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
                Your personal information is handled according to applicable privacy laws. For questions or requests concerning your data, contact KAAZE support.
              </p>
            </section>
          </div>

          {/* BEFORE YOU PROCEED Section */}
          <PurchaseTermsSection />

          {/* Navigation Links */}
          <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-surface-container font-mono font-label-sm text-label-sm">
            <Link
              href="/shop"
              className="text-primary hover:underline underline-offset-4 uppercase font-semibold"
            >
              ← EXPLORE CATALOGUE
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
