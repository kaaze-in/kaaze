'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/data';
import { Product } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          } else if (!data.isLiveShopify) {
            setProducts(PRODUCTS);
          }
        })
        .catch(() => {
          setProducts(PRODUCTS);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query, products]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-surface-container-lowest/90 backdrop-blur-md flex items-start justify-center pt-20 px-margin">
      <div className="w-full max-w-3xl bg-surface-container-low border border-primary p-space-lg flex flex-col gap-space-md shadow-2xl animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
              [ ARCHIVE INDEX SEARCH ]
            </span>
            <span className="text-outline">//</span>
            <span className="font-label-sm text-label-sm text-primary uppercase font-mono">
              QUERY_PROTOCOL_V4
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface hover:text-primary p-1 focus:outline-none"
            aria-label="Close search"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="relative w-full">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="TYPE TO SEARCH BY STYLE, SKU, OR CATEGORY..."
            className="w-full bg-surface-container-lowest border border-surface-container focus:border-primary text-primary font-label-md text-label-md px-space-md py-space-sm outline-none uppercase tracking-wider placeholder:text-outline"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary font-label-sm"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm">
          <span className="text-outline uppercase tracking-wider">SUGGESTIONS:</span>
          {['TEE', 'HOODIE', 'CARGO', 'PARKA', 'BOOT', 'WATCH', 'CHAIN'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="px-2 py-0.5 bg-surface-container border border-surface-container hover:border-primary hover:text-primary text-on-surface-variant transition-colors uppercase font-mono"
            >
              [{tag}]
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto space-y-space-xs border-t border-surface-container pt-space-sm">
          {query && results.length === 0 && (
            <div className="py-space-xl text-center font-label-sm text-label-sm text-outline uppercase tracking-widest">
              [ ZERO ARTIFACTS MATCH SPECIFICATION "{query}" ]
            </div>
          )}

          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              onClick={onClose}
              className="group flex items-center justify-between p-space-sm bg-surface-container-lowest hover:bg-surface-container border border-surface-container hover:border-primary transition-all"
            >
              <div className="flex items-center gap-space-md">
                <div className="relative w-12 h-16 bg-surface-container shrink-0 border border-surface-container overflow-hidden">
                  <img
                    src={product.images[0]?.src}
                    alt={product.title}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <div className="font-label-sm text-[10px] text-outline uppercase tracking-widest font-mono">
                    {product.sku} // {product.category.toUpperCase()}
                  </div>
                  <h4 className="font-title-lg text-[15px] uppercase text-primary group-hover:text-primary">
                    {product.title}
                  </h4>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    {product.specSummary || product.gsm}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-label-md text-label-md text-primary font-bold">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="block font-label-sm text-[10px] text-outline group-hover:text-primary uppercase tracking-widest">
                  VIEW ARTIFACT →
                </span>
              </div>
            </Link>
          ))}

          {!query && (
            <div className="py-space-md text-center font-label-sm text-label-sm text-outline uppercase tracking-widest">
              [ ENTER AN ARCHIVE QUERY TO RETRIEVE RELEASES ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
