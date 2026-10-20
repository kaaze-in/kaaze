'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();

  // Selected states
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || 'WASHED ONYX'
  );
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[2] || product.sizes[0] || 'L');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Accordion states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    details: true,
    fit: false,
    dispatch: false,
  });
  const [isDirectCheckingOut, setIsDirectCheckingOut] = useState<boolean>(false);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Match active Shopify variant
  const matchingVariant =
    product.variants?.length === 1 && product.variants[0].title.toLowerCase() === 'default title'
      ? product.variants[0]
      : product.variants?.find((v) => {
          const matchesSize =
            !selectedSize ||
            v.selectedOptions?.some(
              (o) => o.name.toLowerCase() === 'size' && o.value.toLowerCase() === selectedSize.toLowerCase()
            ) ||
            v.title.toLowerCase().includes(selectedSize.toLowerCase());

          const matchesColor =
            !selectedColor ||
            v.selectedOptions?.some(
              (o) =>
                (o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour') &&
                o.value.toLowerCase() === selectedColor.toLowerCase()
            ) ||
            v.title.toLowerCase().includes(selectedColor.toLowerCase());

          return matchesSize && matchesColor;
        }) || product.variants?.[0];

  const currentPrice = matchingVariant?.price || product.price;
  const currentCompareAtPrice = matchingVariant?.compareAtPrice || product.compareAtPrice;
  const isAvailable = matchingVariant ? matchingVariant.available : product.inStock !== false;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(product, selectedSize, selectedColor, quantity, matchingVariant?.id);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleDirectCheckout = async () => {
    if (!isAvailable) return;
    const resolvedVariantId = matchingVariant?.id || product.variants?.[0]?.id;
    if (!resolvedVariantId) {
      addToCart(product, selectedSize, selectedColor, quantity);
      router.push('/cart');
      return;
    }

    try {
      setIsDirectCheckingOut(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              productId: product.id,
              variantId: resolvedVariantId,
              handle: product.handle,
              title: product.title,
              price: currentPrice,
              quantity,
              selectedSize,
              selectedColor,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl && (data.checkoutUrl.startsWith('http') || data.checkoutUrl.startsWith('https'))) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // If direct checkout URL wasn't returned, add to cart and fallback to cart page
      addToCart(product, selectedSize, selectedColor, quantity, resolvedVariantId);
      router.push('/cart');
    } catch (err) {
      console.warn('Direct checkout fallback to cart:', err);
      addToCart(product, selectedSize, selectedColor, quantity, resolvedVariantId);
      router.push('/cart');
    } finally {
      setIsDirectCheckingOut(false);
    }
  };

  const activeImage = product.images[activeImageIndex] || product.images[0];

  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* TOP CONTEXT / BREADCRUMB BAR */}
      <div className="w-full bg-surface-container-lowest px-margin md:px-margin-tablet lg:px-margin-desktop py-space-sm border-b border-surface-container">
        <div className="flex flex-wrap items-center justify-between gap-space-xs font-label-sm text-label-sm tracking-widest text-outline">
          <nav className="flex items-center gap-space-xs uppercase">
            <Link href="/" className="hover:text-primary transition-colors">
              HOME
            </Link>
            <span className="text-surface-bright">/</span>
            <Link href="/shop" className="hover:text-primary transition-colors">
              SHOP
            </Link>
            <span className="text-surface-bright">/</span>
            <Link
              href={`/shop?category=${product.category}`}
              className="hover:text-primary transition-colors"
            >
              {product.category.toUpperCase()}
            </Link>
            <span className="text-surface-bright">/</span>
            <span className="text-on-surface">{product.title}</span>
          </nav>
          <div className="hidden md:flex items-center gap-space-md text-on-surface-variant font-label-sm font-mono">
            <span>ARCHIVE REF: {product.sku}</span>
            <span>•</span>
            <span className="text-primary">{product.seriesTag || 'KAAZE // 2026'}</span>
          </div>
        </div>
      </div>

      {/* MAIN PRODUCT SECTION: TWO-COLUMN ASYMMETRIC GRID */}
      <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-lg lg:py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
          {/* LEFT COLUMN: EDITORIAL PRODUCT GALLERY (7 of 12) */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            {/* Main Stage Container */}
            <div className="relative w-full aspect-[3/4] bg-surface-container-lowest border border-surface-container overflow-hidden group">
              {/* Live Status Tag Pin */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-space-xs bg-surface/90 backdrop-blur-sm px-3 py-1 border border-surface-container">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-label-sm tracking-widest text-primary uppercase font-mono">
                  STUDIO SPEC // CAM-A
                </span>
              </div>
              <div className="absolute top-4 right-4 z-20 font-label-sm text-label-sm tracking-widest text-outline uppercase bg-surface/80 px-2 py-1 font-mono">
                VIEW: <span className="text-primary">{activeImage?.viewLabel || 'FRONT'}</span>
              </div>

              {/* Main Active Image */}
              <img
                src={activeImage?.src}
                alt={activeImage?.alt || product.title}
                className="w-full h-full object-cover object-center transition-opacity duration-200 grayscale contrast-125"
              />

              {/* Monospace Technical Coordinates Watermark */}
              <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex flex-col text-surface-bright font-label-sm text-[9px] tracking-widest font-mono">
                <span>SPEC: {product.specs.material || product.gsm || '340 GSM ORGANIC COTTON'}</span>
                <span>SHADE: #0B0B0C MONOCHROME</span>
                <span>STRUCTURE: {product.specs.fit || 'DROPPED BOXY SHOULDER'}</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-space-sm" id="galleryThumbnails">
              {product.images.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`group relative aspect-[3/4] bg-surface-container-lowest transition-all p-0 text-left focus:outline-none overflow-hidden ${
                      isActive
                        ? 'border-2 border-primary'
                        : 'border border-surface-container hover:border-outline'
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className={`w-full h-full object-cover grayscale contrast-125 ${
                        isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                      }`}
                    />
                    <span
                      className={`absolute bottom-1 left-1 font-label-sm text-[9px] tracking-widest px-1 font-mono ${
                        isActive
                          ? 'bg-surface/90 text-primary font-bold'
                          : 'bg-surface/90 text-on-surface-variant'
                      }`}
                    >
                      {img.indexTag || `0${idx + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Technical Spec Micro-bar */}
            <div className="w-full border-t border-b border-surface-container py-space-sm flex flex-wrap items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-widest font-mono">
              <span>MILL: {product.specs.origin || 'SHIZUOKA CIRCULAR KNIT'}</span>
              <span>WEIGHT: {product.gsm || '340 GSM'}</span>
              <span>DYE: {product.specs.dye || 'ENZYME WASHED REACTIVE'}</span>
            </div>
          </div>

          {/* RIGHT COLUMN: PRODUCT SPECIFICATIONS & ACTIONS (STICKY, 5 of 12) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 flex flex-col gap-space-lg">
              {/* Header / Collection Metadata */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-label-md text-label-md tracking-widest text-outline uppercase">
                    [ {product.collectionTag || 'DROP 01 // ARCHITECTURAL ESSENTIALS'} ]
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest">
                    {product.seriesTag || 'SERIES-2026'}
                  </span>
                </div>
                <h1 className="font-display-lg text-headline-lg lg:text-display-lg uppercase text-primary tracking-tight leading-none mt-1">
                  {product.title}
                </h1>

                {/* Price & Stock Status Line */}
                <div className="flex items-center justify-between pt-space-xs border-b border-surface-container pb-space-md">
                  <div className="flex items-baseline gap-space-sm">
                    <span className="font-headline-md text-headline-md text-primary tracking-wider font-mono">
                      ₹{currentPrice.toLocaleString()}
                    </span>
                    {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
                      <span className="font-body-md text-body-md text-outline line-through font-mono">
                        ₹{currentCompareAtPrice.toLocaleString()}
                      </span>
                    )}
                    {product.discountBadge && (
                      <span className="bg-surface-container-highest px-2 py-0.5 font-label-sm text-label-sm tracking-widest text-primary font-mono">
                        {product.discountBadge}
                      </span>
                    )}
                  </div>

                  {/* Stock Indicator */}
                  <div className="flex items-center gap-space-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? 'bg-emerald-400' : 'bg-red-500'
                      }`}
                    ></span>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-mono">
                      {isAvailable ? product.stockStatus : 'ARCHIVED // SOLD OUT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Synopsis */}
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {product.description}
              </p>

              {/* Swatches / Colors Selection */}
              {product.colors.length > 0 && (
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between font-label-md text-label-md uppercase tracking-widest">
                    <span className="text-outline">COLORWAY:</span>
                    <span className="text-primary font-semibold font-mono">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    {product.colors.map((color) => {
                      const isColorActive = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color.name)}
                          aria-label={`Select ${color.name}`}
                          className={`group relative w-10 h-10 p-0.5 focus:outline-none transition-colors ${
                            isColorActive
                              ? 'border-2 border-primary bg-[#0d0d0e]'
                              : 'border border-surface-container hover:border-outline bg-[#131313]'
                          }`}
                        >
                          <span
                            className="w-full h-full block border border-surface-container"
                            style={{ backgroundColor: color.hex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection Grid */}
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between font-label-md text-label-md uppercase tracking-widest">
                  <span className="text-outline">SELECT SIZE:</span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4 cursor-pointer font-mono"
                  >
                    [ SIZE GUIDE ]
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-space-xs">
                  {product.sizes.map((size) => {
                    const isSizeActive = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 flex items-center justify-center font-label-md text-label-md focus:outline-none uppercase transition-colors font-mono ${
                          isSizeActive
                            ? 'border border-primary bg-primary text-on-primary font-bold'
                            : 'border border-surface-container bg-surface text-on-surface hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Fit Advisory */}
                <div className="flex items-center gap-space-xs text-outline font-body-sm text-body-sm pt-1">
                  <span className="material-symbols-outlined text-[16px]">straighten</span>
                  <span>Model is 6'1" wearing size L for signature oversized silhouette.</span>
                </div>
              </div>

              {/* Quantity Stepper & Add to Cart */}
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <div className="flex gap-space-sm">
                  {/* Stepper */}
                  <div className="flex items-center border border-surface-container bg-surface-container-lowest h-13 px-2">
                    <button
                      type="button"
                      aria-label="Decrease Quantity"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors"
                    >
                      —
                    </button>
                    <span className="w-10 text-center font-label-md text-label-md text-primary font-medium font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase Quantity"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Primary Add to Cart Button */}
                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={handleAddToCart}
                    className={`flex-1 font-label-md text-label-md tracking-[0.15em] uppercase font-bold py-4 px-6 border transition-all flex items-center justify-center gap-space-sm ${
                      isAvailable
                        ? 'bg-primary text-on-primary border-primary hover:bg-surface hover:text-primary cursor-pointer'
                        : 'bg-surface-container text-outline border-surface-container cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    <span>
                      {!isAvailable
                        ? 'SOLD OUT'
                        : addedToast
                        ? '✓ ALLOCATED TO CART'
                        : 'ADD TO CART'}
                    </span>
                  </button>
                </div>

                {/* Direct Checkout Secondary Button */}
                <button
                  type="button"
                  disabled={!isAvailable || isDirectCheckingOut}
                  onClick={handleDirectCheckout}
                  className={`w-full font-label-md text-label-md tracking-[0.15em] uppercase font-bold py-3.5 transition-all flex items-center justify-center gap-space-xs ${
                    isAvailable && !isDirectCheckingOut
                      ? 'bg-transparent text-primary border border-outline hover:border-primary hover:bg-surface-container-low cursor-pointer'
                      : 'bg-surface-container text-outline border-surface-container cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>
                    {isDirectCheckingOut
                      ? 'CONNECTING TO CHECKOUT...'
                      : isAvailable
                      ? 'DIRECT CHECKOUT'
                      : 'UNAVAILABLE'}
                  </span>
                  {!isDirectCheckingOut && (
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  )}
                </button>
              </div>

              {/* Assurance Badges Grid */}
              <div className="border border-surface-container bg-surface-container-lowest p-space-md grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    local_shipping
                  </span>
                  <div>
                    <span className="block font-label-sm text-label-sm uppercase tracking-wider text-primary">
                      COMPLIMENTARY TRANSIT
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      Express across India & worldwide dispatch available.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    autorenew
                  </span>
                  <div>
                    <span className="block font-label-sm text-label-sm uppercase tracking-wider text-primary">
                      7-DAY RETURNS WINDOW
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      Hassle-free reverse pickup & size exchange.
                    </span>
                  </div>
                </div>
              </div>

              {/* Accordion Specification Modules */}
              <div className="flex flex-col border-t border-surface-container">
                {/* Accordion Item 1: Product Details */}
                <div className="border-b border-surface-container">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('details')}
                    className="w-full py-space-md flex items-center justify-between text-left group focus:outline-none"
                  >
                    <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-mono">
                      [ {openAccordions.details ? '-' : '+'} ] PRODUCT DETAILS &amp; FABRICATION
                    </span>
                    <span
                      className={`material-symbols-outlined text-outline group-hover:text-primary transition-transform duration-200 text-[18px] ${
                        openAccordions.details ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {openAccordions.details && (
                    <div className="pb-space-md text-on-surface-variant font-body-sm space-y-space-sm">
                      <div className="grid grid-cols-2 gap-y-2 border-t border-surface-container-high pt-space-sm font-label-sm font-mono">
                        <span className="text-outline uppercase">[MATERIAL]</span>
                        <span className="text-on-surface">
                          {product.specs.material || '340 GSM 100% Combed French Terry'}
                        </span>
                        <span className="text-outline uppercase">[WEAVE]</span>
                        <span className="text-on-surface">
                          {product.specs.weave || 'High-density loopback circular knit'}
                        </span>
                        <span className="text-outline uppercase">[COLLAR]</span>
                        <span className="text-on-surface">
                          {product.specs.collar || 'Reinforced 1x1 elastane ribbed ribbing'}
                        </span>
                        <span className="text-outline uppercase">[FINISH]</span>
                        <span className="text-on-surface">
                          {product.specs.finish || 'Pre-shrunk, enzyme silicone washed'}
                        </span>
                        <span className="text-outline uppercase">[ORIGIN]</span>
                        <span className="text-on-surface">
                          {product.specs.origin || 'Engineered in Tokyo / Milled in Shizuoka'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion Item 2: Size & Fit */}
                <div className="border-b border-surface-container">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('fit')}
                    className="w-full py-space-md flex items-center justify-between text-left group focus:outline-none"
                  >
                    <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-mono">
                      [ {openAccordions.fit ? '-' : '+'} ] SIZE &amp; STRUCTURAL FIT
                    </span>
                    <span
                      className={`material-symbols-outlined text-outline group-hover:text-primary transition-transform duration-200 text-[18px] ${
                        openAccordions.fit ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {openAccordions.fit && (
                    <div className="pb-space-md text-on-surface-variant font-body-sm space-y-space-xs">
                      <p>
                        Designed with an exaggerated, boxy architectural drape. Features an aggressive
                        drop-shoulder stance that stays elevated away from the torso.
                      </p>
                      <ul className="list-disc list-inside text-outline pt-1 space-y-1">
                        <li>Choose true standard size for signature runway oversized silhouette.</li>
                        <li>Size down one full increment for a standard, relaxed fit.</li>
                        <li>Blind hem and clean collar circumference prevents warping after wash.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion Item 3: Shipping & Logistics */}
                <div className="border-b border-surface-container">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('dispatch')}
                    className="w-full py-space-md flex items-center justify-between text-left group focus:outline-none"
                  >
                    <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-mono">
                      [ {openAccordions.dispatch ? '-' : '+'} ] DISPATCH &amp; CARGO TERMS
                    </span>
                    <span
                      className={`material-symbols-outlined text-outline group-hover:text-primary transition-transform duration-200 text-[18px] ${
                        openAccordions.dispatch ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {openAccordions.dispatch && (
                    <div className="pb-space-md text-on-surface-variant font-body-sm space-y-space-xs">
                      <p>
                        Dispatched securely in matte 100% recyclable protective air-cushioned casing
                        within 24–48 hours from our central fulfillment terminal.
                      </p>
                      <p className="text-outline">
                        Standard domestic transit time: 2–4 business days via DHL Express / Bluedart
                        Air. Global air couriers dispatched DDP (Duties Delivered Paid).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION SEPARATOR LINE */}
      <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">
        <div className="w-full border-t border-surface-container flex items-center justify-between pt-space-xs font-label-sm text-label-sm text-outline uppercase tracking-widest font-mono">
          <span>INDEX: RECOM_MOD_04</span>
          <span>KAAZE SYSTEM // 2026</span>
        </div>
      </div>

      {/* "YOU MAY ALSO LIKE" / COMPLEMENTARY PIECES */}
      <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop pb-space-xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-space-lg gap-space-xs">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-widest text-outline">
              [ COMPLEMENTARY PIECES ]
            </span>
            <h2 className="font-display-lg text-display-lg-mobile lg:text-headline-lg uppercase text-primary tracking-tight mt-space-xs">
              COMPLETE THE UNIFORM
            </h2>
          </div>
          <Link
            href="/shop"
            className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-space-xs"
          >
            <span>EXPLORE FULL ARCHIVE</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* 4-Column Product Recommendation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
          {relatedProducts.map((rel) => (
            <div
              key={rel.id}
              className="group flex flex-col bg-surface-container-lowest border border-surface-container hover:border-primary transition-colors"
            >
              <Link
                href={`/products/${rel.handle}`}
                className="relative aspect-[3/4] overflow-hidden bg-surface-container block"
              >
                <img
                  alt={rel.title}
                  src={rel.images[0]?.src}
                  className="w-full h-full object-cover transition-opacity duration-200 grayscale contrast-125 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 font-label-sm text-label-sm tracking-widest bg-surface/90 text-primary px-2 py-0.5 border border-surface-container font-mono">
                  {rel.sku}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(rel, rel.sizes[0] || 'L', rel.colors[0]?.name || 'ONYX', 1);
                  }}
                  className="absolute bottom-0 left-0 right-0 py-3 bg-primary text-on-primary font-label-sm text-label-sm tracking-widest uppercase font-bold text-center translate-y-full group-hover:translate-y-0 transition-transform duration-150"
                >
                  QUICK ADD
                </button>
              </Link>
              <div className="p-space-md flex flex-col justify-between flex-1 gap-space-sm border-t border-surface-container">
                <div className="flex flex-col gap-0.5">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest font-mono">
                    {rel.specSummary || rel.gsm}
                  </span>
                  <Link href={`/products/${rel.handle}`}>
                    <h3 className="font-title-lg text-title-lg text-primary tracking-tight uppercase line-clamp-1 hover:text-primary/80">
                      {rel.title}
                    </h3>
                  </Link>
                </div>
                <div className="flex items-center justify-between pt-space-xs border-t border-surface-container font-label-md text-label-md">
                  <span className="text-primary font-bold font-mono">
                    ₹{rel.price.toLocaleString()}
                  </span>
                  <span className="text-outline uppercase font-mono">
                    {rel.colors[0]?.name || 'ONYX'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SIZE GUIDE MODAL DIALOG */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center p-margin">
          <div className="bg-surface-container-low border border-primary max-w-xl w-full p-space-lg flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono">
                  [ SPEC // METRIC TABLE ]
                </span>
                <h3 className="font-headline-md text-headline-md text-primary uppercase">
                  SIZE ARCHITECTURE (INCHES)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-on-surface hover:text-primary p-1 focus:outline-none"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-label-md text-label-md border-collapse font-mono">
                <thead>
                  <tr className="border-b border-surface-container text-outline">
                    <th className="py-2 pr-4 font-normal uppercase">SIZE</th>
                    <th className="py-2 px-4 font-normal uppercase">CHEST</th>
                    <th className="py-2 px-4 font-normal uppercase">LENGTH</th>
                    <th className="py-2 px-4 font-normal uppercase">SHOULDER</th>
                    <th className="py-2 pl-4 font-normal uppercase">SLEEVE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-on-surface">
                  <tr>
                    <td className="py-2.5 pr-4 font-label-md text-primary">S</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">44.0&quot;</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">28.5&quot;</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">22.0&quot;</td>
                    <td className="py-2.5 pl-4 text-on-surface-variant">8.5&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-label-md text-primary">M</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">46.5&quot;</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">29.5&quot;</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">23.0&quot;</td>
                    <td className="py-2.5 pl-4 text-on-surface-variant">9.0&quot;</td>
                  </tr>
                  <tr className="bg-surface-container">
                    <td className="py-2.5 pr-4 font-label-md text-primary font-bold">L (REF)</td>
                    <td className="py-2.5 px-4 text-primary font-semibold">49.0&quot;</td>
                    <td className="py-2.5 px-4 text-primary font-semibold">30.5&quot;</td>
                    <td className="py-2.5 px-4 text-primary font-semibold">24.0&quot;</td>
                    <td className="py-2.5 pl-4 text-primary font-semibold">9.5&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-label-md text-primary">XL</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">51.5&quot;</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">31.5&quot;</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">25.0&quot;</td>
                    <td className="py-2.5 pl-4 text-on-surface-variant">10.0&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-label-md text-primary">XXL</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">54.0&quot;</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">32.5&quot;</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">26.0&quot;</td>
                    <td className="py-2.5 pl-4 text-on-surface-variant">10.5&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border-t border-surface-container pt-space-sm flex justify-between items-center text-outline font-label-sm text-label-sm">
              <span className="font-mono">TOLERANCE: +/- 0.5 INCHES</span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="bg-primary text-on-primary px-4 py-1.5 uppercase font-bold tracking-widest text-label-sm hover:bg-surface-container-high hover:text-primary transition-colors"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
