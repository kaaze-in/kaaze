'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/lib/data';
import { Product } from '@/types';

interface CartClientProps {
  recommendedProducts?: Product[];
}

export const CartClient: React.FC<CartClientProps> = ({ recommendedProducts }) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    discountCode,
    total,
    freeShippingThreshold,
    shippingRemaining,
    hasFreeShipping,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    addToCart,
    populateDefaultCart,
    isCustomEmptyOverride,
    toggleMockState,
    createCheckoutUrl,
  } = useCart();

  const [promoInput, setPromoInput] = useState<string>('');
  const [promoFeedback, setPromoFeedback] = useState<{ message: string; isError: boolean } | null>(
    null
  );
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoFeedback({ message: res.message, isError: !res.success });
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleProceedCheckout = () => {
    setCheckoutModalOpen(true);
  };

  const recommendationHandles = [
    'heavyweight-box-hoodie',
    'architectural-nylon-parka',
    'ribbed-merino-beanie',
    'tactical-modular-harness-crossbody',
  ];

  const recommendations =
    recommendedProducts && recommendedProducts.length > 0
      ? recommendedProducts
      : PRODUCTS.filter((p) => recommendationHandles.includes(p.handle));

  const percentFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* TOP CONTEXT UTILITY / ARCHIVE STATUS BAR */}
      <div className="w-full bg-surface-container-lowest px-margin md:px-margin-desktop py-space-sm border-b border-[#262626]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-md flex-wrap font-mono">
            <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">
              [ ARCHIVE REF: 2026-CRT // DISPATCH ORDER ]
            </span>
            <span className="hidden sm:inline text-outline-variant">|</span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
              KAAZE CART TERMINAL
            </span>
          </div>

          {/* DEV / INSPECTION STATE TOGGLER (Stitch Original) */}
          <div className="flex items-center gap-space-xs self-start sm:self-auto bg-surface-container-high p-1">
            <button
              type="button"
              onClick={() => toggleMockState('populated')}
              className={`font-label-sm text-label-sm uppercase tracking-wider px-2 py-1 transition-all duration-100 font-mono ${
                !isCustomEmptyOverride && items.length > 0
                  ? 'bg-primary text-on-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              [ POPULATED VIEW ]
            </button>
            <button
              type="button"
              onClick={() => toggleMockState('empty')}
              className={`font-label-sm text-label-sm uppercase tracking-wider px-2 py-1 transition-all duration-100 font-mono ${
                isCustomEmptyOverride || items.length === 0
                  ? 'bg-primary text-on-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              [ EMPTY VIEW ]
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CART CONTENT AREA */}
      <div className="w-full px-margin md:px-margin-desktop py-space-lg md:py-space-xl">
        {items.length === 0 || isCustomEmptyOverride ? (
          /* EMPTY CART VIEW */
          <div className="w-full flex flex-col items-center justify-center py-space-xl text-center space-y-space-lg">
            {/* Architectural Framing Graphic */}
            <div className="relative w-full max-w-xl aspect-[16/9] bg-surface-container-lowest border border-[#262626] overflow-hidden flex items-center justify-center">
              <img
                alt="Empty Architectural Runway"
                className="w-full h-full object-cover grayscale contrast-125 opacity-40"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjyKnBwLo1ffZ_fPnKCJN9lANhEjF9Whb6ukB_Stf8NxqA6JsuCEXOSWXAU55iHkFiB4CVJHsbkkZEjaU4_70d_iv8NOK3IbG46M9JJB-4FvilWhta8KforwMOyAGtPHTiP_kYAAspkie0-hkro_58pvyYAJHhblW9H8bX7oOrWir9YVTK3rM859N5zrdjHzeMrTNIdPZtSUZLNrm0_HEokuvkrdGI8T6-mcNRTEDUuRsiSpIApLk"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-space-md bg-gradient-to-t from-background via-background/60 to-transparent">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-1 font-mono">
                  [ TERMINAL STATUS: VOID ]
                </span>
                <span className="font-headline-md text-headline-md uppercase text-primary font-mono">
                  0 ARTIFACTS ALLOCATED
                </span>
              </div>
            </div>

            {/* Typography Callout */}
            <div className="max-w-md space-y-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline font-mono">
                [ MANIFEST REGISTRATION ]
              </span>
              <h2 className="font-display-lg text-display-lg uppercase tracking-tight text-primary leading-none m-0">
                YOUR BAG IS EMPTY.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant uppercase tracking-wider pt-space-xs">
                Looks like you haven't found your next favourite piece yet. The archive is waiting.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-space-sm flex flex-col sm:flex-row items-center gap-space-md">
              <Link
                href="/shop"
                className="px-space-xl py-3.5 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-[0.15em] font-bold hover:bg-surface-container-highest hover:text-primary transition-all duration-100 flex items-center gap-2"
              >
                <span>EXPLORE COLLECTIONS</span>
                <span className="material-symbols-outlined text-[18px]">north_east</span>
              </Link>
              <button
                type="button"
                onClick={populateDefaultCart}
                className="px-space-md py-3.5 bg-transparent border border-[#404040] hover:border-primary text-on-surface hover:text-primary font-label-sm text-label-sm uppercase tracking-widest font-mono"
              >
                [ RESTORE SAMPLE BAG ]
              </button>
            </div>

            {/* Quick Navigation Category Chips */}
            <div className="pt-space-lg border-t border-[#262626] w-full max-w-2xl">
              <div className="font-label-sm text-label-sm text-outline tracking-widest uppercase mb-space-sm font-mono">
                DIRECT ROUTING // QUICK INDEX:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-space-xs font-mono">
                <Link
                  href="/shop?category=clothing"
                  className="font-label-sm text-label-sm uppercase tracking-widest px-3 py-1.5 bg-surface-container-lowest border border-[#262626] hover:border-primary hover:text-primary transition-colors"
                >
                  [ BROWSE HOODIES ]
                </Link>
                <Link
                  href="/shop?category=clothing"
                  className="font-label-sm text-label-sm uppercase tracking-widest px-3 py-1.5 bg-surface-container-lowest border border-[#262626] hover:border-primary hover:text-primary transition-colors"
                >
                  [ BROWSE TEES ]
                </Link>
                <Link
                  href="/shop?category=clothing"
                  className="font-label-sm text-label-sm uppercase tracking-widest px-3 py-1.5 bg-surface-container-lowest border border-[#262626] hover:border-primary hover:text-primary transition-colors"
                >
                  [ BROWSE CARGOS ]
                </Link>
                <Link
                  href="/shop"
                  className="font-label-sm text-label-sm uppercase tracking-widest px-3 py-1.5 bg-surface-container-lowest border border-[#262626] hover:border-primary hover:text-primary transition-colors"
                >
                  [ NEW RELEASES ARCH-V04 ]
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* POPULATED CART VIEW */
          <div className="w-full flex flex-col space-y-space-xl">
            {/* HERO / BAG TITLE STRIP */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg border-b border-[#262626]">
              <div>
                <div className="flex items-center gap-space-xs text-outline mb-space-xs font-mono">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest">
                    [ DISPATCH MANIFEST ]
                  </span>
                  <span>/</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary">
                    STATUS: READY FOR TERMINAL
                  </span>
                </div>
                <h1 className="font-display-xl text-display-xl uppercase tracking-tight text-primary leading-none m-0">
                  YOUR BAG.
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant uppercase tracking-wide mt-2">
                  Your style starts here. Architectural precision in everyday staples.
                </p>
              </div>
              <div className="flex items-center gap-space-sm font-mono">
                <span className="font-label-md text-label-md uppercase tracking-widest px-3 py-1.5 bg-surface-container-high text-primary border border-[#262626]">
                  [ {itemCount} {itemCount === 1 ? 'ARTIFACT' : 'ARTIFACTS'} IN BAG ]
                </span>
              </div>
            </div>

            {/* CART CONTENT: ASYMMETRICAL 65% / 35% GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
              {/* LEFT COLUMN: ITEMS & TRANSIT METER (8 of 12) */}
              <div className="lg:col-span-8 flex flex-col space-y-space-lg">
                {/* FREE SHIPPING PROGRESS BAR */}
                <div className="bg-surface-container-lowest p-space-md border border-[#262626]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-sm font-mono">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-primary"></span>
                      {hasFreeShipping
                        ? `COMPLIMENTARY EXPRESS TRANSIT UNLOCKED (₹${subtotal.toLocaleString()} / ₹${freeShippingThreshold.toLocaleString()})`
                        : `ADD ₹${shippingRemaining.toLocaleString()} MORE TO UNLOCK COMPLIMENTARY EXPRESS`}
                    </span>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
                      TIER: GLOBAL_AIR
                    </span>
                  </div>

                  {/* Meter Track */}
                  <div className="w-full h-1 bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${percentFreeShipping}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-space-xs font-mono">
                    <span className="font-label-sm text-label-sm uppercase text-outline tracking-wider">
                      STANDARD REGISTRATION
                    </span>
                    <span className="font-label-sm text-label-sm uppercase text-primary tracking-wider">
                      {hasFreeShipping ? 'EXPRESS COURIER MET' : `TARGET: ₹5,000`}
                    </span>
                  </div>
                </div>

                {/* ITEMS LIST */}
                <div className="flex flex-col border-t border-[#262626]">
                  {items.map((item, idx) => (
                    <div
                      key={item.lineId}
                      className="cart-line-item py-space-lg border-b border-[#262626] transition-opacity duration-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                        {/* Thumbnail */}
                        <div className="md:col-span-3">
                          <div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden border border-[#262626]">
                            <img
                              src={item.image}
                              alt={item.imageAlt}
                              className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                            />
                            <span className="absolute top-2 left-2 font-label-sm text-label-sm uppercase tracking-widest bg-background/90 text-primary px-1.5 py-0.5 border border-[#262626] font-mono">
                              [{idx < 9 ? `0${idx + 1}` : idx + 1}]
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-6 flex flex-col justify-between">
                          <div className="space-y-space-xs">
                            <div className="font-label-sm text-label-sm text-outline tracking-widest uppercase font-mono">
                              {item.sku}
                            </div>
                            <Link href={`/products/${item.handle}`}>
                              <h2 className="font-headline-md text-headline-md uppercase tracking-wide text-primary hover:text-primary/80 transition-colors">
                                {item.title}
                              </h2>
                            </Link>

                            <div className="pt-space-xs space-y-1 font-label-sm text-label-sm uppercase font-mono">
                              <div className="flex items-center gap-space-sm text-on-surface-variant">
                                <span className="text-outline">[COLOR]</span>
                                <span className="text-on-surface">{item.selectedColor}</span>
                              </div>
                              <div className="flex items-center gap-space-sm text-on-surface-variant">
                                <span className="text-outline">[SIZE]</span>
                                <span className="text-on-surface">{item.selectedSize}</span>
                              </div>
                              <div className="flex items-center gap-space-sm text-on-surface-variant">
                                <span className="text-outline">[SPEC]</span>
                                <span className="text-on-surface">{item.specSummary}</span>
                              </div>
                            </div>
                          </div>

                          {/* Stepper & Remove */}
                          <div className="flex items-center gap-space-lg pt-space-md">
                            <div className="flex items-center border border-[#262626] bg-surface-container-lowest font-mono">
                              <button
                                aria-label="Decrease quantity"
                                type="button"
                                onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                              >
                                -
                              </button>
                              <span className="w-10 text-center font-label-md text-label-md text-primary">
                                {item.quantity}
                              </span>
                              <button
                                aria-label="Increase quantity"
                                type="button"
                                onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.lineId)}
                              className="font-label-sm text-label-sm uppercase tracking-widest text-outline hover:text-primary transition-colors flex items-center gap-1 font-mono"
                            >
                              <span>[ REMOVE ITEM × ]</span>
                            </button>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="md:col-span-3 flex md:flex-col justify-between md:items-end md:text-right pt-2 md:pt-0 font-mono">
                          <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                            UNIT: ₹{item.price.toLocaleString()}
                          </div>
                          <div className="font-title-lg text-title-lg uppercase tracking-tight text-primary">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* LOGISTICS TERMINAL NOTE */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm p-space-md bg-surface-container-lowest border border-[#262626] font-mono">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-outline text-[20px]">
                      local_shipping
                    </span>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                      DISPATCH FROM BERLIN-TOKYO FULFILLMENT HUB WITHIN 24 HOURS.
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
                    DIRECT PROTOCOL // PRIORITY AIR
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: STICKY ORDER SUMMARY (4 of 12) */}
              <div className="lg:col-span-4 sticky top-24">
                <div className="bg-surface-container-lowest p-space-lg border border-[#262626] flex flex-col space-y-space-md">
                  {/* Summary Header */}
                  <div className="flex items-center justify-between pb-space-sm border-b border-[#262626]">
                    <h2 className="font-headline-md text-headline-md uppercase tracking-wider text-primary">
                      ORDER SUMMARY
                    </h2>
                    <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase font-mono">
                      [PRE-CHECKOUT]
                    </span>
                  </div>

                  {/* Price Breakdown Rows */}
                  <div className="space-y-space-xs font-label-md text-label-md uppercase tracking-wider font-mono">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>SUBTOTAL</span>
                      <span className="text-primary font-title-lg text-[16px]">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>TRANSIT / FREIGHT</span>
                      <span className="text-primary">
                        {hasFreeShipping ? 'COMPLIMENTARY (EXPRESS)' : '₹499 (AIR DISPATCH)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>DUTIES &amp; TAXES</span>
                      <span className="text-outline">INCLUDED IN PRICE</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-primary">
                        <span className="flex items-center gap-1">
                          <span>DISCOUNT</span>
                          <span className="text-[10px] px-1 bg-surface-container-high border border-[#262626]">
                            [{discountCode}]
                          </span>
                        </span>
                        <span className="font-bold">-₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Brutalist Coupon Input Block */}
                  <div className="pt-space-xs pb-space-xs border-y border-[#262626]">
                    <label
                      htmlFor="promo-input"
                      className="block font-label-sm text-label-sm uppercase tracking-widest text-outline mb-1.5 font-mono"
                    >
                      DISCOUNT OR ARCHIVE PASSCODE
                    </label>
                    <form
                      onSubmit={handleApplyPromo}
                      className="flex items-stretch border border-[#262626] focus-within:border-primary transition-colors"
                    >
                      <input
                        id="promo-input"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="ENTER CODE (TRY: KAAZE10)"
                        className="w-full bg-background px-3 py-2 font-label-sm text-label-sm uppercase text-primary placeholder:text-outline focus:outline-none tracking-widest font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary px-4 font-label-sm text-label-sm uppercase tracking-widest transition-all duration-100 flex items-center justify-center font-mono font-bold"
                      >
                        APPLY
                      </button>
                    </form>
                    {promoFeedback && (
                      <p
                        className={`font-label-sm text-label-sm uppercase tracking-widest mt-1 font-mono ${
                          promoFeedback.isError ? 'text-error' : 'text-primary'
                        }`}
                      >
                        {promoFeedback.message}
                      </p>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div className="pt-space-xs flex items-baseline justify-between font-mono">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline block">
                        ESTIMATED TOTAL
                      </span>
                      <span className="font-label-sm text-label-sm uppercase text-outline">
                        INR (₹) INCL. TAXES
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-headline-lg text-headline-lg tracking-tight text-primary block leading-none">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Notice */}
                  <p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider leading-relaxed">
                    Shipping, custom duties, and localized tax obligations are finalized at terminal
                    dispatch.
                  </p>

                  {/* Primary Checkout CTA */}
                  <button
                    type="button"
                    onClick={handleProceedCheckout}
                    className="w-full py-3.5 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-[0.15em] font-bold hover:bg-background hover:text-primary hover:border hover:border-primary transition-all duration-100 flex items-center justify-center gap-2"
                  >
                    <span>PROCEED TO CHECKOUT</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  {/* Secondary Return Link */}
                  <div className="text-center pt-space-xs">
                    <Link
                      href="/shop"
                      className="font-label-sm text-label-sm uppercase tracking-widest text-outline hover:text-primary transition-colors inline-flex items-center gap-1 font-mono"
                    >
                      <span>← CONTINUE SHOPPING</span>
                    </Link>
                  </div>

                  {/* Trust / Guarantee Matrix */}
                  <div className="pt-space-sm border-t border-[#262626] grid grid-cols-1 gap-1.5 font-label-sm text-label-sm uppercase tracking-widest text-outline font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary"></span>
                      <span>ENCRYPTED TRANSIT GATEWAY</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary"></span>
                      <span>COMPLIMENTARY 7-DAY RESPEC / RETURN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary"></span>
                      <span>AUTHENTICITY ARCHIVE VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RECOMMENDATIONS ("COMPLETE YOUR LOOK") SECTION */}
            <div className="pt-space-xl border-t border-[#262626]">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs pb-space-lg">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline font-mono">
                    [ SILHOUETTE SYNCHRONIZATION ]
                  </span>
                  <h2 className="font-headline-lg text-headline-lg uppercase tracking-tight text-primary m-0">
                    COMPLETE YOUR LOOK.
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant uppercase tracking-wider mt-1">
                    Curated complements engineered to balance your selected silhouettes.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="font-label-sm text-label-sm uppercase tracking-widest text-outline hover:text-primary transition-colors flex items-center gap-1 font-mono"
                >
                  <span>VIEW COMPLETE LOOKBOOK →</span>
                </Link>
              </div>

              {/* 4-Card Editorial Horizontal Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
                {recommendations.map((rec, i) => (
                  <div
                    key={rec.id}
                    className="group flex flex-col bg-surface-container-lowest border border-[#262626] hover:border-primary transition-all duration-100"
                  >
                    <Link
                      href={`/products/${rec.handle}`}
                      className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container block"
                    >
                      <img
                        alt={rec.title}
                        src={rec.images[0]?.src}
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 font-label-sm text-label-sm uppercase tracking-widest bg-background/90 text-primary px-1.5 py-0.5 border border-[#262626] font-mono">
                        KZ-REC-0{i + 1}
                      </span>
                    </Link>
                    <div className="p-space-md flex flex-col justify-between flex-1 space-y-space-sm border-t border-[#262626]">
                      <div>
                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline font-mono">
                          {rec.category.toUpperCase()} // {rec.specSummary || rec.gsm}
                        </span>
                        <Link href={`/products/${rec.handle}`}>
                          <h3 className="font-title-lg text-[15px] uppercase tracking-wide text-primary mt-1 line-clamp-1 hover:text-primary/80">
                            {rec.title}
                          </h3>
                        </Link>
                        <div className="font-label-md text-label-md text-on-surface uppercase tracking-wider mt-1 font-mono">
                          ₹{rec.price.toLocaleString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart(rec, rec.sizes[0] || 'L', rec.colors[0]?.name || 'ONYX', 1)
                        }
                        className="w-full py-2 bg-transparent border border-[#404040] hover:border-primary hover:bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-widest transition-all duration-100 font-mono"
                      >
                        [ + QUICK ADD ]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHECKOUT TERMS & BEFORE YOU PROCEED MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center p-margin">
          <div className="bg-surface-container-low border-2 border-primary max-w-xl w-full p-space-md sm:p-space-lg flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-100 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
              <span className="font-label-sm text-label-sm tracking-widest text-primary uppercase">
                [ PURCHASE ACKNOWLEDGEMENT ]
              </span>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="text-on-surface hover:text-primary p-1 focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="space-y-space-xs text-on-surface-variant font-body-sm">
              <h3 className="text-primary font-bold text-headline-md font-sans uppercase">
                BEFORE YOU PROCEED
              </h3>
              <p className="font-body-sm text-on-surface-variant font-sans">
                Please review our purchase terms before placing your order.
              </p>

              <ul className="space-y-2.5 mt-3 text-body-sm font-sans border-y border-surface-container py-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-mono font-bold">•</span>
                  <span>
                    <strong className="text-primary font-semibold">No returns or exchanges:</strong> Purchases are final, subject to applicable consumer rights.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-mono font-bold">•</span>
                  <span>
                    <strong className="text-primary font-semibold">Product details:</strong> Review the description, size, specifications, and images carefully before ordering.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-mono font-bold">•</span>
                  <span>
                    <strong className="text-primary font-semibold">Third-party fulfilment:</strong> Products may be sourced and shipped by external suppliers or logistics partners.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-mono font-bold">•</span>
                  <span>
                    <strong className="text-primary font-semibold">Delivery:</strong> Delivery estimates may vary depending on the supplier and courier.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-mono font-bold">•</span>
                  <span>
                    <strong className="text-primary font-semibold">Order confirmation:</strong> Verify your shipping address and contact information before completing payment.
                  </span>
                </li>
              </ul>

              {/* Checkbox */}
              <label className="flex items-start gap-3 mt-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-none border-primary text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
                />
                <span className="text-primary font-mono text-label-sm uppercase tracking-wide font-medium">
                  I have read and understood the purchase terms and no-return policy.
                </span>
              </label>
              {checkoutError && (
                <p className="text-error font-mono text-label-sm uppercase tracking-wide">
                  [ {checkoutError} ]
                </p>
              )}
            </div>

            <div className="border-t border-surface-container pt-space-md flex flex-col sm:flex-row items-center justify-end gap-3 font-mono">
              <button
                type="button"
                disabled={isCheckingOut}
                onClick={() => setCheckoutModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 border border-surface-container text-on-surface hover:text-primary hover:border-primary uppercase font-bold tracking-widest text-label-sm transition-colors text-center"
              >
                [ CANCEL ]
              </button>
              <button
                type="button"
                disabled={!termsAccepted || isCheckingOut}
                onClick={async () => {
                  try {
                    setIsCheckingOut(true);
                    setCheckoutError(null);
                    const checkoutUrl = await createCheckoutUrl();
                    if (checkoutUrl && (checkoutUrl.startsWith('http') || checkoutUrl.startsWith('https'))) {
                      window.location.href = checkoutUrl;
                      return;
                    }
                    if (checkoutUrl && checkoutUrl.includes('simulated_checkout')) {
                      alert('Shopify checkout ready! Redirecting to secure checkout terminal once credentials are configured.');
                      setCheckoutModalOpen(false);
                      return;
                    }
                    window.location.href = checkoutUrl;
                  } catch {
                    setCheckoutError('Failed to initialize checkout. Please try again.');
                  } finally {
                    setIsCheckingOut(false);
                  }
                }}
                className={`w-full sm:w-auto px-6 py-2.5 uppercase font-bold tracking-widest text-label-sm transition-colors border text-center ${
                  termsAccepted && !isCheckingOut
                    ? 'bg-primary text-on-primary border-primary hover:bg-surface-container-high hover:text-primary cursor-pointer'
                    : 'bg-surface-container text-outline border-surface-container cursor-not-allowed opacity-60'
                }`}
              >
                {isCheckingOut ? '[ CONNECTING TO TERMINAL... ]' : '[ CONTINUE TO CHECKOUT ]'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
