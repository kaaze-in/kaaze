import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-surface-container">
      <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop border-b border-surface-container pb-space-xl">
          {/* Brand & Manifesto Column */}
          <div className="md:col-span-6 flex flex-col justify-between pr-0 lg:pr-space-xl">
            <div className="mb-space-lg">
              <h2
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.12em' }}
                className="font-display-lg text-display-lg-mobile lg:text-display-lg uppercase text-primary tracking-tight leading-none mb-space-sm font-bold"
              >
                KAAZE
              </h2>
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-outline mb-space-xs">
                [ TACTICAL LUXURY APPAREL // ARCH-V04 ]
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md leading-relaxed">
                Curated essentials and statement pieces for elevated everyday style. Built around individuality, driven by self-expression. Never ordinary.
              </p>
            </div>
            <div className="flex items-center gap-space-sm font-label-sm text-label-sm uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-outline">OPERATIONAL STATUS:</span>
              <span className="text-primary font-mono">DISPATCH ACTIVE // INDIA</span>
            </div>
          </div>

          {/* Directives Navigation */}
          <div className="md:col-span-3 flex flex-col">
            <h3 className="font-label-md text-label-md uppercase text-outline mb-space-md tracking-widest">
              [DIRECTIVES]
            </h3>
            <nav className="flex flex-col gap-space-sm font-label-md text-label-md uppercase">
              <Link
                href="/our-story"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/shipping-returns"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Shipping & Logistics
              </Link>
              <Link
                href="/privacy-policy"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-conditions"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Terms & Conditions
              </Link>
            </nav>
          </div>

          {/* Transmissions Links */}
          <div className="md:col-span-3 flex flex-col">
            <h3 className="font-label-md text-label-md uppercase text-outline mb-space-md tracking-widest">
              [TRANSMISSIONS]
            </h3>
            <nav className="flex flex-col gap-space-sm mb-space-lg font-label-md text-label-md uppercase">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between border-b border-surface-container py-space-xs"
              >
                <span>Instagram</span>
                <span className="material-symbols-outlined text-[16px]">north_east</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between border-b border-surface-container py-space-xs"
              >
                <span>Twitter / X</span>
                <span className="material-symbols-outlined text-[16px]">north_east</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between border-b border-surface-container py-space-xs"
              >
                <span>YouTube</span>
                <span className="material-symbols-outlined text-[16px]">north_east</span>
              </a>
            </nav>
            <div className="border border-surface-container p-space-sm bg-surface-container-low font-label-sm text-outline">
              <span className="block text-primary uppercase font-bold mb-1">
                MANGALURU ORIGIN NODE
              </span>
              <span>12.9141° N, 74.8560° E</span>
            </div>
          </div>
        </div>

        {/* Legal & System Signature */}
        <div className="pt-space-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm font-label-sm text-label-sm text-outline uppercase tracking-widest">
          <div>© 2026 KAAZE. ALL RIGHTS RESERVED. NOT MADE TO FIT IN.</div>
          <div className="text-on-surface-variant font-mono">
            SYSTEM CODE: ARCH-V04 // BERLIN-TOKYO
          </div>
        </div>
      </div>
    </footer>
  );
};
