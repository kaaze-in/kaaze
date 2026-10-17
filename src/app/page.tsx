'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/data';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const filterCategories = [
    { label: 'ALL', value: 'all' },
    { label: 'CLOTHES', value: 'clothing' },
    { label: 'SHOES', value: 'shoes' },
    { label: 'WATCHES', value: 'watches' },
    { label: 'ACCESSORIES', value: 'accessories' },
  ];

  const filteredProducts =
    activeCategory === 'all'
      ? products.slice(0, 4)
      : products.filter((p) => p.category === activeCategory).slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setNewsletterSubmitted(true);
      setEmailInput('');
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO / MAIN LANDING SECTION */}
      <section className="relative w-full -mt-16 bg-surface-container-lowest overflow-hidden">
        <div className="relative w-full min-h-[92vh] flex flex-col justify-end">
          {/* Background Image with Brutalist Film Grain Overlay */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat grayscale brightness-[0.78] contrast-[1.25] opacity-40 dark:opacity-100"
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB2k4SiBPyYWZreJ4BD1KkkKX0e2YqZP8OohOsBBXJymgPxz5TP5sR4nj3ldkLOIRaz5Nl5qBkTDfU5XJQPw6GIYxpjs1sQmNieyxnQR6hwsfFA420ewgzPmcaQMwCKzezx5elYg7lDQtI1A3F1dRF0VOe71ppkd0c6kw-gqGRxG5b12QbDLnEX3b-PmLnG2DM_VMXQtfrNqnsUufb1LGE7M7Tt1IfmvCXzMZTTMySAFqNKmIXX7iI")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/65 to-surface-container-lowest/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-surface-container-lowest/40 to-surface-container-lowest/90" />

          {/* Typography & CTA Content */}
          <div className="relative z-10 w-full px-margin md:px-margin-tablet lg:px-margin-desktop pb-space-xl pt-space-lg">
            <div className="max-w-6xl pl-0 sm:pl-space-xl">
              <h1 className="font-display-xl text-display-xl-mobile md:text-display-xl text-primary uppercase tracking-tight leading-[0.88] select-none">
                <span className="block font-headline-lg text-[24px] md:text-[31px] tracking-[0.3em] text-primary mb-1">
                  NOT MADE TO FIT IN.
                </span>
                <span
                  style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.08em' }}
                  className="block mt-2 font-bold"
                >
                  KAAZEe
                </span>
              </h1>
              <div className="mt-space-md max-w-2xl">
                <p className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-tight tracking-wide">
                  <strong>Your Style. Your Energy.</strong>
                </p>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs font-light tracking-wide">
                  Set your own trends. Own your vibe.
                </p>
              </div>
              <div className="mt-space-lg flex flex-col sm:flex-row items-start sm:items-center gap-space-md pt-space-xs">
                <Link
                  href="/shop"
                  className="group relative inline-flex items-center justify-center px-space-lg py-space-sm bg-primary text-on-primary font-label-md text-label-md uppercase tracking-[0.2em] transition-all duration-100 hover:bg-surface-container-lowest hover:text-primary hover:outline hover:outline-1 hover:outline-primary active:scale-[0.99] font-bold"
                >
                  [ SHOP NOW ]
                </Link>
                <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm tracking-[0.2em]">
                  <span className="w-2 h-2 bg-primary"></span>
                  <span className="text-primary font-medium">BE DIFFERENT. BE KAAZE.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT LINEUP SECTION */}
      <section
        className="w-full bg-surface px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl"
        id="the-lineup"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-surface-container pb-space-md mb-space-lg gap-space-sm">
          <div>
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline tracking-widest uppercase mb-space-xs">
              <span>CATALOGUE // DROP 01</span>
              <span>•</span>
              <span className="text-primary">CORE RELEASES</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-primary tracking-wide">
              THE LINEUP
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs pt-space-sm md:pt-0 font-label-md text-label-md tracking-widest uppercase">
            {filterCategories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`px-space-md py-space-xs font-medium border transition-colors duration-150 ${
                  activeCategory === cat.value
                    ? 'bg-primary text-on-primary border-primary font-bold'
                    : 'bg-surface-container-lowest text-on-surface-variant border-surface-container hover:border-primary hover:text-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Card Editorial Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="lineup" />
          ))}
        </div>

        {/* Explore all link */}
        <div className="mt-space-lg text-center pt-space-md border-t border-surface-container">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-space-sm font-label-md text-label-md uppercase text-primary tracking-[0.2em] border-b border-primary/40 pb-1 hover:border-primary transition-all font-semibold"
          >
            <span>VIEW ALL ARTIFACTS IN CATALOGUE</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
              east
            </span>
          </Link>
        </div>
      </section>

      {/* 3. OUR STORIES SECTION (Asymmetric Split Editorial) */}
      <section className="w-full bg-surface-container-lowest border-y border-surface-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
          {/* Left Editorial Visual Frame */}
          <div className="lg:col-span-7 relative overflow-hidden min-h-[420px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-surface-container">
            <div
              className="absolute inset-0 bg-cover bg-center grayscale contrast-125 filter"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB2k4SiBPyYWZreJ4BD1KkkKX0e2YqZP8OohOsBBXJymgPxz5TP5sR4nj3ldkLOIRaz5Nl5qBkTDfU5XJQPw6GIYxpjs1sQmNieyxnQR6hwsfFA420ewgzPmcaQMwCKzezx5elYg7lDQtI1A3F1dRF0VOe71ppkd0c6kw-gqGRxG5b12QbDLnEX3b-PmLnG2DM_VMXQtfrNqnsUufb1LGE7M7Tt1IfmvCXzMZTTMySAFqNKmIXX7iI")`,
              }}
            />
            <div className="absolute inset-0 bg-surface-container-lowest/40" />
            {/* Framing Watermarks */}
            <div className="absolute top-space-md left-space-md font-label-sm text-label-sm uppercase text-primary/80 tracking-[0.3em] bg-surface/90 px-space-sm py-space-xs border border-surface-container">
              FIGURE REF: BRUTALIST RUNWAY 01
            </div>
            <div className="absolute bottom-space-md left-space-md right-space-md flex items-end justify-between font-label-sm text-label-sm text-outline">
              <span className="tracking-widest">COORDINATES: 52.5200° N, 13.4050° E</span>
              <span className="tracking-widest">[REBEL // MANIFESTO]</span>
            </div>
          </div>

          {/* Right Manifesto Copy Area */}
          <div className="lg:col-span-5 p-margin md:p-margin-tablet lg:p-space-xl flex flex-col justify-between bg-surface-container-lowest">
            <div>
              <div className="flex items-center gap-space-sm font-label-sm text-label-sm uppercase text-outline tracking-widest mb-space-lg font-mono">
                <span>VOLUME 01 — THE DISCOVERY</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-primary tracking-wide mb-space-lg">
                OUR STORIES
              </h2>
              <blockquote className="font-headline-md text-headline-md text-primary font-normal leading-snug tracking-wide uppercase border-l-2 border-primary pl-space-md mb-space-lg">
                “GOOD TASTE. BETTER FINDS. ZERO ORDINARY.”
              </blockquote>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                We bring together standout fashion and lifestyle finds from around the world, making original products and exciting deals easier to discover.
              </p>
              {/* Technical Spec Index List */}
              <div className="mt-space-lg border-t border-surface-container pt-space-md space-y-space-xs font-label-sm text-label-sm font-mono">
                <div className="py-1.5 border-b border-surface-container/60">
                  <span className="text-primary tracking-wider uppercase">[ CURATED FINDS ]</span>
                </div>
                <div className="py-1.5 border-b border-surface-container/60">
                  <span className="text-primary tracking-wider uppercase">[ GLOBAL INFLUENCE ]</span>
                </div>
                <div className="py-1.5 border-b border-surface-container/60">
                  <span className="text-primary tracking-wider uppercase">[ BETTER DEALS ]</span>
                </div>
              </div>
            </div>
            <div className="pt-space-xl">
              <Link
                href="/our-story"
                className="group inline-flex items-center gap-space-sm font-label-md text-label-md uppercase text-primary tracking-[0.2em] border-b border-primary/40 pb-1 hover:border-primary transition-all font-semibold"
              >
                <span>EXPLORE OUR WORLD</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  east
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT US SECTION (Refined Editorial Pairing) */}
      <section className="w-full bg-surface px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
          {/* Text & Technical Credo */}
          <div className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1 pr-0 lg:pr-space-lg">
            <span className="font-label-sm text-label-sm uppercase text-outline tracking-widest mb-space-xs">
              PHILOSOPHY &amp; DISCOVERY
            </span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg uppercase text-primary tracking-tight leading-none mb-space-md">
              MORE THAN A LOOK.
            </h2>
            <div className="space-y-space-md text-on-surface-variant font-body-lg text-body-lg">
              <p className="leading-relaxed">
                KAAZE is for those who know their vibe. Discover original finds, standout styles, and deals worth looking twice at.
              </p>
              <p className="font-body-md text-body-md text-outline">
                Style that speaks. Finds that surprise.
              </p>
            </div>
            {/* Spec Detail Table */}
            <div className="my-space-lg grid grid-cols-3 gap-gutter border-y border-surface-container py-space-md font-label-sm text-label-sm">
              <div>
                <span className="text-outline block mb-1">DISCOVERY</span>
                <span className="text-primary font-medium tracking-wider font-mono">
                  ALWAYS SOMETHING NEW
                </span>
              </div>
              <div>
                <span className="text-outline block mb-1">VALUE</span>
                <span className="text-primary font-medium tracking-wider font-mono">
                  DEALS WORTH FINDING
                </span>
              </div>
              <div>
                <span className="text-outline block mb-1">IDENTITY</span>
                <span className="text-primary font-medium tracking-wider font-mono">
                  YOUR STYLE, YOUR RULES
                </span>
              </div>
            </div>
            <div>
              <Link
                href="/our-story"
                className="group inline-flex items-center gap-space-sm font-label-md text-label-md uppercase text-primary tracking-[0.2em] border-b border-primary/40 pb-1 hover:border-primary transition-all font-semibold"
              >
                <span>DISCOVER KAAZE</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  east
                </span>
              </Link>
            </div>
          </div>
          {/* Editorial Image Inset */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative bg-surface-container border border-surface-container p-space-xs">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  alt="KAAZE Architectural Garment Silhouette"
                  className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHu-EIMDOYiCCydERyfqXm0DFER7ZLrByEtj3zJFtFbuGO9e7EW5VPhuvhdLttibxV7_8zUanqVWp8MNYH2C9MYT3IGHdHDwwv6HnW3o6vq8RHzxrFSkNqU058fq2nfhcPhnF0PLJokNJBX8Sg067UopSE2FNF61oQJm102wX_oYKBPi9c6QdSlk7cCHbemdA6JFtUD2FcTssGvJiuCZamj7214HbKgv-_q1zUQ5zFAALjnb7Tpmg"
                />
              </div>
              <div className="p-space-sm flex justify-between items-center font-label-sm text-label-sm text-outline uppercase tracking-wider">
                <span>STUDIO SILHOUETTE: 03-BOMBER</span>
                <span>CUSTOM TEXTILE MILLING</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. JOIN THE CLUB SECTION (Minimal Brutalist Form) */}
      <section className="w-full bg-surface-container-lowest border-t border-surface-container px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <span className="font-label-sm text-label-sm uppercase text-outline tracking-[0.25em] mb-space-xs">
            DISPATCH DIRECTIVE // MEMBERS ARCHIVE
          </span>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg uppercase text-primary tracking-tight leading-none mb-space-sm">
            JOIN THE KAAZE CLUB.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-space-lg leading-relaxed">
            Get closer to the culture. Stay connected with KAAZE. Receive private runway previews,
            sudden drop links, and archival access.
          </p>
          {/* Minimal Subscription Terminal Form */}
          <form className="w-full max-w-xl" onSubmit={handleNewsletterSubmit}>
            <div className="flex flex-col sm:flex-row items-stretch gap-0 border border-surface-container focus-within:border-primary transition-colors">
              <input
                aria-label="Email Address for KAAZE Club"
                className="flex-1 px-space-md py-space-md bg-surface text-primary font-label-md text-label-md uppercase tracking-wider placeholder:text-outline focus:outline-none"
                placeholder="ENTER YOUR EMAIL"
                required
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button
                className="px-space-lg py-space-md bg-primary text-on-primary font-label-md text-label-md uppercase tracking-[0.2em] font-medium transition-all duration-100 hover:bg-surface-container-high hover:text-primary active:scale-[0.99] border-t sm:border-t-0 sm:border-l border-surface-container"
                type="submit"
              >
                JOIN NOW
              </button>
            </div>
            {newsletterSubmitted && (
              <p className="text-left font-label-sm text-label-sm text-primary uppercase tracking-widest mt-space-xs font-mono">
                [ ACCESS GRANTED // DISPATCH FREQUENCY SET ]
              </p>
            )}
          </form>
          {/* Dedicated Customer Account Access */}
          <div className="mt-space-lg pt-space-md border-t border-surface-container w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-outline uppercase tracking-wider">
            <span>Already part of the collective?</span>
            <Link
              href="/account"
              className="text-primary hover:underline underline-offset-4 tracking-widest"
            >
              [ Log In / Create Account ]
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
