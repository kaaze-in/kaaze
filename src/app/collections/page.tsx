import React, { Suspense } from 'react';
import Link from 'next/link';
import { getProducts, productMatchesCategory } from '@/lib/shopify';
import { PRODUCTS } from '@/lib/data';
import { ShopClient } from '../shop/ShopClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections // Directory — KAAZE',
  description:
    'Explore the complete KAAZE collection directory: Clothing, Shoes, Watches, and Accessories. Architectural brutalism in everyday staples.',
};

interface CollectionsPageProps {
  searchParams?: {
    category?: string;
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const products = await getProducts();
  const categoryParam = searchParams?.category?.toLowerCase();
  const validCategories = ['all', 'clothing', 'shoes', 'watches', 'accessories'];

  // If a category filter is directly active on /collections, show the filtered products view
  if (categoryParam && validCategories.includes(categoryParam)) {
    return (
      <Suspense
        fallback={
          <div className="w-full py-space-xl text-center font-label-md text-outline uppercase tracking-widest">
            [ RETRIEVING ARCHIVE DIRECTORY... ]
          </div>
        }
      >
        <ShopClient initialProducts={products} />
      </Suspense>
    );
  }

  // Live accurate products & counts based on actual Shopify collection membership
  const clothingProducts = products.filter((p) => productMatchesCategory(p, 'clothing'));
  const shoesProducts = products.filter((p) => productMatchesCategory(p, 'shoes'));
  const watchesProducts = products.filter((p) => productMatchesCategory(p, 'watches'));
  const accessoriesProducts = products.filter((p) => productMatchesCategory(p, 'accessories'));

  const clothingCount = clothingProducts.length;
  const shoesCount = shoesProducts.length;
  const watchesCount = watchesProducts.length;
  const accessoriesCount = accessoriesProducts.length;

  const categories = [
    {
      slug: 'clothing',
      index: '01',
      tag: '01 // APPAREL',
      title: 'CLOTHING',
      subtitle: 'ARCHITECTURAL APPAREL',
      description:
        'Engineered garments, heavyweight boxy tees, structural outerwear, and relaxed silhouettes crafted for form and endurance.',
      count: clothingCount,
      image:
        clothingProducts.find((p) => p.images?.[0]?.src)?.images[0].src ||
        PRODUCTS.find((p) => p.category === 'clothing')?.images[0]?.src ||
        '',
    },
    {
      slug: 'shoes',
      index: '02',
      tag: '02 // FOOTWEAR',
      title: 'SHOES',
      subtitle: 'MONOLITHIC FOOTWEAR',
      description:
        'Sculpted Vibram lug-sole combat boots, minimalist derby trainers, and tactical slip-ons built with artisanal craftsmanship.',
      count: shoesCount,
      image:
        shoesProducts.find((p) => p.images?.[0]?.src)?.images[0].src ||
        PRODUCTS.find((p) => p.category === 'shoes')?.images[0]?.src ||
        '',
    },
    {
      slug: 'watches',
      index: '03',
      tag: '03 // HOROLOGY',
      title: 'WATCHES',
      subtitle: 'PRECISION HOROLOGY',
      description:
        'Grade 5 Titanium chronographs, automatic mechanical field timepieces, and anti-reflective sapphire dials engineered to endure.',
      count: watchesCount,
      image:
        watchesProducts.find((p) => p.images?.[0]?.src)?.images[0].src ||
        PRODUCTS.find((p) => p.category === 'watches')?.images[0]?.src ||
        '',
    },
    {
      slug: 'accessories',
      index: '04',
      tag: '04 // HARDWARE',
      title: 'ACCESSORIES',
      subtitle: 'TACTICAL HARDWARE',
      description:
        'Solid 925 sterling silver curb chains, ballistic cordura modular accessories, and everyday brutalist carry essentials.',
      count: accessoriesCount,
      image:
        accessoriesProducts.find((p) => p.images?.[0]?.src)?.images[0].src ||
        PRODUCTS.find((p) => p.category === 'accessories')?.images[0]?.src ||
        '',
    },
  ];

  return (
    <div className="flex flex-col w-full flex-1 bg-surface">
      {/* 1. DIRECTORY HEADER */}
      <section className="w-full bg-surface-container-lowest border-b border-surface-container px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline tracking-widest uppercase mb-space-xs">
            <span>ARCHIVE DIRECTORY</span>
            <span>•</span>
            <span className="text-primary font-mono">COLLECTIONS // DROP 01</span>
          </div>
          <h1
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.04em' }}
            className="font-display-lg text-display-lg-mobile md:text-display-lg uppercase text-primary tracking-tight leading-none font-bold"
          >
            COLLECTIONS
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-sm leading-relaxed">
            Curated sectors structured around architectural minimalism and tactical luxury. Select a collection below to browse specific garments, footwear, timepieces, or hardware.
          </p>

          {/* Directory Meta Indicators */}
          <div className="mt-space-lg pt-space-sm border-t border-surface-container flex flex-wrap items-center justify-between gap-space-sm font-label-sm text-label-sm text-outline uppercase tracking-widest">
            <div className="flex flex-wrap items-center gap-space-md font-mono">
              <span>
                SECTORS: <strong className="text-primary">[ 04 DEPARTMENTS ]</strong>
              </span>
              <span className="text-surface-container-high">//</span>
              <span>
                TOTAL INVENTORY: <strong className="text-primary">[{products.length} ARTIFACTS]</strong>
              </span>
              <span className="text-surface-container-high">//</span>
              <span className="text-emerald-500 font-semibold">STATUS: LIVE</span>
            </div>
            <Link
              href="/shop"
              className="text-primary hover:underline underline-offset-4 font-mono font-medium flex items-center gap-space-xs"
            >
              <span>[ VIEW ALL ARTIFACTS ]</span>
              <span className="material-symbols-outlined text-[14px]">east</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 4-CATEGORY COLLECTION DIRECTORY GRID */}
      <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col bg-surface-container-lowest border border-surface-container hover:border-primary transition-all duration-200"
              >
                {/* Visual Frame */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-surface-container">
                  {cat.image ? (
                    <img
                      alt={cat.title}
                      src={cat.image}
                      className="w-full h-full object-cover object-center grayscale contrast-125 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-outline text-label-sm uppercase">
                      [ ARCHIVE FRAME ]
                    </div>
                  )}

                  {/* Top Tag Badges */}
                  <div className="absolute top-space-sm left-space-sm right-space-sm flex items-center justify-between pointer-events-none">
                    <span className="px-space-xs py-0.5 bg-surface-container-lowest/90 font-label-sm text-label-sm uppercase tracking-wider text-primary border border-surface-container font-mono">
                      {cat.tag}
                    </span>
                    <span className="px-space-xs py-0.5 bg-primary text-on-primary font-mono text-label-sm tracking-widest font-bold">
                      [{cat.count}]
                    </span>
                  </div>

                  {/* Bottom Action Prompt Overlay on Hover */}
                  <div className="absolute inset-x-0 bottom-0 p-space-sm bg-gradient-to-t from-surface-container-lowest to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                      [ VIEW COLLECTION ]
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-primary group-hover:translate-x-1 transition-transform">
                      east
                    </span>
                  </div>
                </div>

                {/* Information Drawer */}
                <div className="p-space-md flex flex-col justify-between flex-grow border-t border-surface-container">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-label-sm text-outline tracking-widest">
                        SECTOR // {cat.index}
                      </span>
                      <span className="font-mono text-label-sm text-primary font-bold">
                        {cat.count} {cat.count === 1 ? 'ITEM' : 'ITEMS'}
                      </span>
                    </div>
                    <h2 className="font-headline-md text-headline-md uppercase text-primary tracking-wide font-bold group-hover:underline underline-offset-4">
                      {cat.title}
                    </h2>
                    <p className="font-label-sm text-label-sm uppercase tracking-wider text-outline mt-0.5 mb-space-sm">
                      {cat.subtitle}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-space-md pt-space-sm border-t border-surface-container flex items-center justify-between font-label-md text-label-md uppercase tracking-wider text-primary font-semibold">
                    <span>EXPLORE {cat.title}</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 3. CATALOGUE ACCESS FOOTER BANNER */}
          <div className="mt-space-xl p-space-lg bg-surface-container-lowest border border-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline block mb-1">
                FULL ARCHIVE DIRECTORY
              </span>
              <h3 className="font-headline-md text-headline-md uppercase text-primary font-bold">
                VIEW ALL CURATED ARTIFACTS
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-1">
                Explore the entire catalogue containing all {products.length} garments, footwear releases, horology pieces, and tactical accessories together.
              </p>
            </div>
            <Link
              href="/shop"
              className="px-space-lg py-space-sm bg-primary text-on-primary font-label-md text-label-md uppercase tracking-[0.2em] font-bold hover:bg-surface-container-high hover:text-primary transition-all inline-flex items-center gap-space-sm whitespace-nowrap"
            >
              <span>[ VIEW ALL ({products.length}) ]</span>
              <span className="material-symbols-outlined text-[16px]">east</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
