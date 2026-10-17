import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story — KAAZE',
  description:
    'KAAZE is built around the idea that personal style has no rules. Born from individuality, driven by discovery.',
};

export default function OurStoryPage() {
  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* Top Meta Bar */}
      <div className="w-full bg-surface-container-lowest px-margin md:px-margin-desktop py-space-sm border-b border-[#262626]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm font-mono">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">
              [ OUR STORY // THE MANIFESTO ]
            </span>
            <span className="hidden sm:inline text-outline-variant">|</span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
              PHILOSOPHY &amp; DISCOVERY
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline uppercase font-mono">
            KAAZE
          </span>
        </div>
      </div>

      {/* Hero Visual Section */}
      <section className="relative w-full bg-surface-container-lowest border-b border-[#262626] overflow-hidden">
        <div className="relative min-h-[60vh] flex flex-col justify-end p-margin md:p-margin-desktop pb-space-xl">
          <div
            className="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-[0.7]"
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB2k4SiBPyYWZreJ4BD1KkkKX0e2YqZP8OohOsBBXJymgPxz5TP5sR4nj3ldkLOIRaz5Nl5qBkTDfU5XJQPw6GIYxpjs1sQmNieyxnQR6hwsfFA420ewgzPmcaQMwCKzezx5elYg7lDQtI1A3F1dRF0VOe71ppkd0c6kw-gqGRxG5b12QbDLnEX3b-PmLnG2DM_VMXQtfrNqnsUufb1LGE7M7Tt1IfmvCXzMZTTMySAFqNKmIXX7iI")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />

          <div className="relative z-10 max-w-4xl space-y-space-md">
            <div className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-outline font-mono">
              KAAZE
            </div>
            <h1 className="font-display-xl text-display-xl-mobile md:text-display-xl uppercase text-primary tracking-tight leading-none">
              NOT MADE TO FIT IN.
            </h1>
            <p className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-tight font-sans">
              BORN FROM INDIVIDUALITY. DRIVEN BY DISCOVERY.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Content Grid */}
      <div className="w-full px-margin md:px-margin-desktop py-space-xl">
        <div className="max-w-5xl mx-auto space-y-space-xl">
          {/* Quote Block */}
          <blockquote className="font-headline-md text-headline-md text-primary font-normal leading-snug tracking-wide uppercase border-l-2 border-primary pl-space-md py-space-xs font-sans">
            KAAZE is built around the idea that personal style has no rules. We explore fashion and lifestyle finds from trusted sources, bringing together standout pieces, original products, and exciting deals for those who prefer something beyond the ordinary.
          </blockquote>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop border-y border-[#262626] py-space-xl">
            <div className="flex flex-col space-y-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline font-mono">
                [ PILLAR 01 ]
              </span>
              <h3 className="font-headline-md text-headline-md uppercase text-primary">
                CURATED DISCOVERY
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                We look for distinctive finds across contemporary fashion and lifestyle, bringing together styles that catch the eye and deserve a closer look.
              </p>
            </div>

            <div className="flex flex-col space-y-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline font-mono">
                [ PILLAR 02 ]
              </span>
              <h3 className="font-headline-md text-headline-md uppercase text-primary">
                STYLE MEETS VALUE
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Discover compelling deals on products that match your taste. Our focus is on finding the right balance between style, quality, and price.
              </p>
            </div>

            <div className="flex flex-col space-y-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline font-mono">
                [ PILLAR 03 ]
              </span>
              <h3 className="font-headline-md text-headline-md uppercase text-primary">
                BEYOND THE BASICS
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                From everyday essentials to statement-making accessories, explore a changing selection of finds that let you express your style your way.
              </p>
            </div>
          </div>

          {/* Our Approach Section */}
          <div className="space-y-space-md">
            <div className="flex items-center justify-between border-b border-[#262626] pb-space-sm font-mono">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
                [ OUR APPROACH ]
              </span>
              <span className="font-label-sm text-label-sm uppercase text-outline">
                CURATION &amp; FINDS
              </span>
            </div>

            <div className="p-space-lg md:p-space-xl bg-surface-container-low border border-[#262626] space-y-space-md">
              <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-primary font-bold tracking-tight">
                GOOD FINDS. ORIGINAL PRODUCTS. BETTER DISCOVERIES.
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-3xl">
                We source products rather than manufacture them, focusing on bringing you a considered selection of fashion and lifestyle finds from external brands and suppliers.
              </p>
              <div className="pt-space-md border-t border-[#262626]">
                <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-primary font-mono block">
                  FASHION · WATCHES · FOOTWEAR · ACCESSORIES · MORE TO DISCOVER
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-space-lg text-center">
            <Link
              href="/collections"
              className="inline-flex items-center gap-space-md px-space-xl py-4 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-[0.2em] font-bold hover:bg-surface-container-high hover:text-primary transition-all"
            >
              <span>EXPLORE THE COLLECTION</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
