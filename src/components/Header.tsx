'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { SearchModal } from './SearchModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, profile } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/shop' },
    { name: 'Our Story', href: '/our-story' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-surface-container">
        <div className="h-16 w-full px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-space-lg">
            <Link href="/" className="flex items-center gap-space-sm group">
              <span
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.12em' }}
                className="font-headline-md text-headline-md tracking-widest text-primary uppercase font-bold"
              >
                KAAZE
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-space-md">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-label-md text-label-md uppercase transition-colors py-space-xs ${
                      active
                        ? 'text-primary border-b border-primary font-medium'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-space-md">
            {/* Search Trigger */}
            <button
              aria-label="Search Archive"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="text-on-surface-variant hover:text-primary transition-colors p-space-xs flex items-center"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Account Link */}
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-space-xs font-label-md text-label-md uppercase text-on-surface-variant hover:text-primary transition-colors p-space-xs"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span>{user ? profile?.firstName || 'Account' : 'Account'}</span>
            </Link>

            {/* Bag Link */}
            <Link
              href="/cart"
              className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors p-space-xs"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              <span className="text-primary font-label-sm text-label-sm tracking-widest">
                [{itemCount}]
              </span>
            </Link>

            {/* User Profile Badge */}
            <Link
              href="/account"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
              title={user ? `Account: ${profile?.firstName || user.email}` : "Customer Account"}
            >
              {user ? (
                <span className="font-mono text-on-primary font-bold text-xs uppercase">
                  {(profile?.firstName?.[0] || user.email?.[0] || 'C').toUpperCase()}
                </span>
              ) : (
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-on-surface hover:text-primary p-space-xs"
              aria-label="Toggle mobile menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden w-full bg-surface-container-lowest border-b border-surface-container px-margin py-space-md flex flex-col gap-space-sm animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container font-label-sm text-outline tracking-widest uppercase">
              <span>[ NAVIGATION DIRECTORY ]</span>
              <span>SYS_MENU</span>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-space-xs font-label-md text-label-md uppercase tracking-wider flex items-center justify-between ${
                  isActive(link.href)
                    ? 'text-primary bg-surface-container font-bold border-l-2 border-primary pl-2'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span>{link.name}</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-surface-container flex items-center justify-between">
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-mono text-label-md uppercase text-primary hover:underline flex items-center justify-between w-full py-1.5"
              >
                <span>{user ? `Account (${profile?.firstName || 'Dashboard'})` : 'Account / Sign In'}</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
