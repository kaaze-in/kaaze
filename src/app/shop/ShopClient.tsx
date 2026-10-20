'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/data';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { productMatchesCategory } from '@/lib/categories';

type CategoryType = 'all' | 'clothing' | 'shoes' | 'watches' | 'accessories';
type SortType = 'newest' | 'price-asc' | 'price-desc';

interface ShopClientProps {
  initialProducts?: Product[];
}

export const ShopClient: React.FC<ShopClientProps> = ({ initialProducts }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : []
  );

  const rawCat = searchParams.get('category')?.toLowerCase() as CategoryType;
  const initialCat = ['all', 'clothing', 'shoes', 'watches', 'accessories'].includes(rawCat)
    ? rawCat
    : 'all';
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(initialCat);
  const [sortOption, setSortOption] = useState<SortType>('newest');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
    // Sync with /api/products on client mount to ensure live collection updates
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else if (!data.isLiveShopify && (!initialProducts || initialProducts.length === 0)) {
          setProducts(PRODUCTS);
        }
      })
      .catch(() => {
        if (!initialProducts || initialProducts.length === 0) {
          setProducts(PRODUCTS);
        }
      });
  }, [initialProducts]);

  useEffect(() => {
    const cat = searchParams.get('category')?.toLowerCase() as CategoryType;
    if (cat && ['all', 'clothing', 'shoes', 'watches', 'accessories'].includes(cat)) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  const handleCategoryChange = (cat: CategoryType) => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      router.push('/shop', { scroll: false });
    } else {
      router.push(`/shop?category=${cat}`, { scroll: false });
    }
  };

  // Filter products based on Shopify collection membership
  const filtered =
    selectedCategory === 'all'
      ? [...products]
      : products.filter((p) => productMatchesCategory(p, selectedCategory));

  // Sort products
  if (sortOption === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  // Live counts for each category based on actual Shopify collection membership
  const counts = {
    all: products.length,
    clothing: products.filter((p) => productMatchesCategory(p, 'clothing')).length,
    shoes: products.filter((p) => productMatchesCategory(p, 'shoes')).length,
    watches: products.filter((p) => productMatchesCategory(p, 'watches')).length,
    accessories: products.filter((p) => productMatchesCategory(p, 'accessories')).length,
  };

  const categories: { label: string; value: CategoryType; count: number }[] = [
    { label: 'ALL', value: 'all', count: counts.all },
    { label: 'CLOTHING', value: 'clothing', count: counts.clothing },
    { label: 'SHOES', value: 'shoes', count: counts.shoes },
    { label: 'WATCHES', value: 'watches', count: counts.watches },
    { label: 'ACCESSORIES', value: 'accessories', count: counts.accessories },
  ];

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Compact Horizontal Category Navigation Bar */}
      <div className="sticky top-16 z-40 w-full bg-surface-container-lowest border-b border-surface-container">
        <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xs flex flex-wrap md:flex-nowrap items-center justify-between gap-space-sm">
          {/* Category Pills / Strip */}
          <nav className="flex items-center gap-space-xs overflow-x-auto flex-nowrap py-space-xs">
            {categories.map((cat, index) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <React.Fragment key={cat.value}>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`cat-btn px-space-md py-space-xs font-label-md text-label-md uppercase tracking-wider transition-colors flex items-center gap-space-xs ${
                      isSelected
                        ? 'bg-primary text-on-primary font-bold'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`font-label-sm text-[10px] ${
                        isSelected ? 'opacity-75' : 'text-outline'
                      }`}
                    >
                      [{cat.count}]
                    </span>
                  </button>
                  {index < categories.length - 1 && (
                    <span className="text-outline-variant select-none">|</span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Right-side Meta & Sort Indicator */}
          <div className="flex items-center gap-space-md font-label-sm text-label-sm text-outline uppercase tracking-widest relative">
            <span id="product-counter" className="font-mono">
              [ SHOWING {filtered.length} ARTIFACTS ]
            </span>
            <span className="hidden sm:inline text-outline-variant">//</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-space-xs text-primary cursor-pointer hover:text-on-surface transition-colors focus:outline-none"
              >
                <span>
                  SORT:{' '}
                  {sortOption === 'newest'
                    ? 'NEWEST'
                    : sortOption === 'price-asc'
                    ? 'PRICE: LOW-HIGH'
                    : 'PRICE: HIGH-LOW'}
                </span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-low border border-primary z-50 p-1 flex flex-col gap-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSortOption('newest');
                      setIsSortOpen(false);
                    }}
                    className={`text-left px-3 py-1.5 font-label-sm text-label-sm uppercase tracking-wider ${
                      sortOption === 'newest'
                        ? 'bg-primary text-on-primary font-bold'
                        : 'text-on-surface hover:text-primary hover:bg-surface-container'
                    }`}
                  >
                    NEWEST RELEASES
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOption('price-asc');
                      setIsSortOpen(false);
                    }}
                    className={`text-left px-3 py-1.5 font-label-sm text-label-sm uppercase tracking-wider ${
                      sortOption === 'price-asc'
                        ? 'bg-primary text-on-primary font-bold'
                        : 'text-on-surface hover:text-primary hover:bg-surface-container'
                    }`}
                  >
                    PRICE: LOW TO HIGH
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOption('price-desc');
                      setIsSortOpen(false);
                    }}
                    className={`text-left px-3 py-1.5 font-label-sm text-label-sm uppercase tracking-wider ${
                      sortOption === 'price-desc'
                        ? 'bg-primary text-on-primary font-bold'
                        : 'text-on-surface hover:text-primary hover:bg-surface-container'
                    }`}
                  >
                    PRICE: HIGH TO LOW
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Listing Grid — Exactly 4 Columns on Desktop, Tablet, and Mobile */}
      <section className="w-full px-1 sm:px-2 md:px-margin-tablet lg:px-margin-desktop py-2 sm:py-space-md md:py-space-lg bg-surface flex-1">
        {filtered.length === 0 ? (
          <div className="py-space-xl text-center font-label-md text-outline uppercase tracking-widest">
            [ NO ARTIFACTS ALLOCATED FOR THIS FILTER SPECIFICATION ]
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 lg:gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} variant="catalog" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
