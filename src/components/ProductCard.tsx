'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  variant?: 'lineup' | 'catalog';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'catalog' }) => {
  const { addToCart } = useCart();
  const [addedToast, setAddedToast] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0] || 'L', product.colors[0]?.name || 'ONYX', 1);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const mainImage = product.images[0]?.src || '';

  if (variant === 'lineup') {
    return (
      <article className="group relative flex flex-col bg-surface-container-lowest border border-surface-container hover:border-primary transition-colors duration-150">
        <Link href={`/products/${product.handle}`} className="block relative w-full aspect-[3/4] overflow-hidden bg-surface-container">
          <img
            alt={product.title}
            src={mainImage}
            className="w-full h-full object-cover object-center grayscale contrast-125 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-space-sm left-space-sm">
            <span className="px-space-xs py-0.5 bg-surface-container-lowest/90 font-label-sm text-label-sm uppercase tracking-wider text-on-surface border border-surface-container">
              {product.specSummary || product.gsm || '340 GSM'}
            </span>
          </div>

          {/* Quick Actions Drawer */}
          <div className="absolute inset-x-0 bottom-0 p-space-sm bg-gradient-to-t from-surface-container-lowest to-transparent flex gap-space-xs opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150">
            <button
              onClick={handleQuickAdd}
              type="button"
              className="flex-1 py-space-xs bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest hover:bg-surface-container-high hover:text-primary transition-colors font-semibold"
            >
              {addedToast ? '✓ ALLOCATED' : 'ADD TO BAG'}
            </button>
            <div
              className="px-space-sm py-space-xs bg-surface-container-high text-primary border border-surface-container hover:border-primary transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[16px] leading-none">visibility</span>
            </div>
          </div>
        </Link>

        <div className="p-space-md flex flex-col justify-between flex-grow border-t border-surface-container">
          <div>
            <div className="font-label-sm text-label-sm text-outline tracking-widest uppercase mb-space-xs">
              {product.sku}
            </div>
            <Link href={`/products/${product.handle}`}>
              <h3 className="font-body-md text-body-md font-medium text-primary uppercase tracking-normal line-clamp-1 hover:text-primary/80 transition-colors">
                {product.title}
              </h3>
            </Link>
          </div>
          <div className="mt-space-md pt-space-xs border-t border-surface-container/60 flex items-center justify-between font-label-md text-label-md">
            <span className="text-on-surface font-semibold">₹{product.price.toLocaleString()}</span>
            <span className="text-outline uppercase tracking-wider">
              {product.specs.fit ? product.specs.fit.split(' ')[0] : 'BOX FIT'}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Catalog variant (Category Listings / Collections page matching reference image)
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const shortDescription =
    product.subtitle ||
    product.specSummary ||
    (product.description ? product.description.slice(0, 50) + '...' : '');

  return (
    <article
      className="product-item group flex flex-col justify-between bg-surface border border-surface-container hover:border-primary/40 transition-all duration-150 relative h-full p-1 sm:p-2 md:p-3 overflow-hidden"
      data-category={product.category}
      data-price={product.price}
      data-product-handle={product.handle}
    >
      <div className="flex flex-col flex-1">
        {/* Large Prominent Product Image */}
        <Link
          href={`/products/${product.handle}`}
          className="block relative w-full aspect-square bg-[#f8f8fa] overflow-hidden mb-1 sm:mb-2 border border-surface-container/60"
        >
          <img
            alt={product.title}
            src={mainImage}
            className="w-full h-full object-contain p-0.5 sm:p-1.5 transition-transform duration-300 group-hover:scale-105"
          />
          {product.colors && product.colors.length > 1 && (
            <div className="absolute bottom-1 right-1 bg-white/95 px-1 py-0.5 border border-surface-container text-[8px] sm:text-[9px] md:text-[10px] text-on-surface-variant font-mono uppercase tracking-tight shadow-sm">
              {product.colors.length} colours
            </div>
          )}
        </Link>

        {/* Product Details */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Product Name */}
          <Link href={`/products/${product.handle}`} className="group-hover:text-primary transition-colors">
            <h3 className="font-title-lg text-[10px] sm:text-xs md:text-sm font-bold text-primary leading-tight line-clamp-1 uppercase tracking-tight">
              {product.title}
            </h3>
          </Link>

          {/* Short Description */}
          {shortDescription && (
            <p className="font-body-sm text-[8px] sm:text-[10px] md:text-xs text-on-surface-variant line-clamp-1 mt-0.5 leading-tight">
              {shortDescription}
            </p>
          )}

          {/* Price Block (Current, Original, Discount) */}
          <div className="mt-1 sm:mt-1.5 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
            <span className="font-title-lg text-[11px] sm:text-xs md:text-sm font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-body-sm text-[8px] sm:text-[9px] md:text-[11px] text-outline line-through">
                ₹{product.compareAtPrice.toLocaleString()}
              </span>
            )}
            {discountPercent && (
              <span className="font-body-sm text-[8px] sm:text-[9px] md:text-[11px] text-[#007600] font-semibold">
                ({discountPercent}% off)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="mt-1.5 sm:mt-2.5 pt-1 border-t border-surface-container/50">
        <button
          onClick={handleQuickAdd}
          type="button"
          aria-label={`Add ${product.title} to cart`}
          className="w-full py-1 sm:py-1.5 px-0.5 sm:px-1 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-label-sm text-[9px] sm:text-[11px] md:text-xs font-semibold text-center transition-colors uppercase tracking-wider active:scale-[0.98] border border-[#fcd200]"
        >
          {addedToast ? '✓ ADDED' : 'ADD TO CART'}
        </button>
      </div>
    </article>
  );
};
