'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { useAuth } from './AuthContext';
import { getSupabase } from '@/lib/supabase';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  discountCode: string | null;
  total: number;
  freeShippingThreshold: number;
  shippingRemaining: number;
  hasFreeShipping: boolean;
  addToCart: (product: Product, size?: string, color?: string, quantity?: number, variantId?: string) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  clearCart: () => void;
  populateDefaultCart: () => void;
  isCustomEmptyOverride: boolean;
  toggleMockState: (target: 'populated' | 'empty') => void;
  isCartSyncing: boolean;
  createCheckoutUrl: (customItems?: CartItem[]) => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 5000;
const LOCAL_STORAGE_KEY = 'kaaze_cart_archive_v1';

const DEFAULT_INITIAL_ITEMS: CartItem[] = [
  {
    lineId: 'gid://shopify/CartLine/l-01-tee',
    productId: 'kz-tee-001',
    handle: 'oversized-essential-tee',
    title: 'KAAZE OVERSIZED ESSENTIAL TEE',
    sku: 'KZ-01 // ARCHITECTURAL ESSENTIALS',
    collectionName: 'ARCHITECTURAL ESSENTIALS',
    price: 1499,
    quantity: 1,
    selectedSize: 'L (CHEST 48")',
    selectedColor: 'WASHED ONYX',
    specSummary: '340 GSM FRENCH TERRY',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACYj9q8pHeFBjlyGdZF84LUhJsAJ6GSimifDsoPekP0frjdoUPOeVpWwLu0CE4PXM2BKhUB6CGblOZ0NRBLa7EP8Kj54qrGHPSE1rl35uYkYuFvQJSI6oq-1xrwx86JcFHE3drybjfWnoqrAIvw98UOsHLMfpHtXTWJHH7Y1D2BZw5gM0S2I7JQhmYQKSB500LL9HdeckryHEjvxtsJWk1N7X3CCnq7LE4tVvm0g1Ajplhfk3xODs',
    imageAlt: 'Editorial lookbook studio photograph of KAAZE Oversized Essential Tee',
  },
  {
    lineId: 'gid://shopify/CartLine/l-02-cargo',
    productId: 'kz-crg-003',
    handle: 'tactical-ballistic-cargo',
    title: 'TACTICAL BALLISTIC CARGO',
    sku: 'KZ-03 // TAILORING',
    collectionName: 'TAILORING',
    price: 4199,
    quantity: 1,
    selectedSize: 'M (WAIST 32")',
    selectedColor: 'MATTE BLACK',
    specSummary: 'CORDURA RIPSTOP 500D',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgukbFkA9vw0MrvUwKyrevPguPmaC0UUeRlQUROiOtj5rPoOG7kUgy9b_I6iWiTwn9yAaOeAiQhLNIYmdxlDtvmlzflZlgqnFnKIMT_CgsgTbrqD-DsqmqxA6dv4kC0rCNImNT8J4RrSJc15vU94z2-rqDUfwKNQwYT_DdM8V7T1bvhvYA6F3afCKqAPMcH-nC57EXss6XED15yiuF75dgUT0a5Ta2uQD0nt33Bfb4Pr1EeAod2Lc',
    imageAlt: 'Monochrome studio portrait of model legs wearing tailored tactical cargo pants',
  },
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isCustomEmptyOverride, setIsCustomEmptyOverride] = useState<boolean>(false);
  const [isCartSyncing, setIsCartSyncing] = useState<boolean>(false);
  const hasHydrated = useRef<boolean>(false);
  const previousUserId = useRef<string | null>(null);

  // 1. Initial Local Storage Load for Guest Sessions
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasHydrated.current) {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter out legacy mock demo items from initial local storage
            const activeItems = parsed.filter(
              (item: CartItem) =>
                item.productId !== 'kz-tee-001' &&
                item.productId !== 'kz-crg-003' &&
                !item.lineId.includes('l-01-tee') &&
                !item.lineId.includes('l-02-cargo')
            );
            if (activeItems.length > 0) {
              setItems(activeItems);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load local cart:', e);
      }
      hasHydrated.current = true;
    }
  }, []);

  // 2. Synchronize to Local Storage for offline/guest persistence
  useEffect(() => {
    if (hasHydrated.current && typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to persist cart locally:', e);
      }
    }
  }, [items]);

  // 3. Supabase Cart Synchronization & Guest Cart Merging
  const syncWithSupabase = useCallback(async (currentItems: CartItem[], userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      setIsCartSyncing(true);

      // Ensure user has a cart container record
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .upsert({ user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .select('id')
        .single();

      if (cartError || !cartData) {
        setIsCartSyncing(false);
        return;
      }

      const cartId = cartData.id;

      // Delete existing saved lines for this cart to overwrite with latest merged set
      await supabase.from('cart_items').delete().eq('cart_id', cartId);

      if (currentItems.length > 0) {
        const rows = currentItems.map((item) => ({
          cart_id: cartId,
          line_id: item.lineId,
          product_id: item.productId,
          handle: item.handle,
          title: item.title,
          sku: item.sku || '',
          collection_name: item.collectionName || '',
          price: item.price,
          quantity: item.quantity,
          selected_size: item.selectedSize || '',
          selected_color: item.selectedColor || '',
          spec_summary: item.specSummary || '',
          image: item.image || '',
          image_alt: item.imageAlt || '',
          updated_at: new Date().toISOString(),
        }));

        await supabase.from('cart_items').insert(rows);
      }
    } catch (err) {
      console.error('Error syncing cart with Supabase:', err);
    } finally {
      setIsCartSyncing(false);
    }
  }, []);

  // 4. Handle Login -> Merge Guest Cart with Supabase Saved Cart
  useEffect(() => {
    const loadAndMergeSupabaseCart = async (userId: string) => {
      const supabase = getSupabase();
      if (!supabase) return;

      setIsCartSyncing(true);
      try {
        // Find existing saved cart for this customer
        const { data: cartData } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (cartData) {
          const { data: remoteItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cartData.id);

          if (remoteItems && remoteItems.length > 0) {
            const mappedRemote: CartItem[] = remoteItems.map((r: any) => ({
              lineId: r.line_id,
              productId: r.product_id,
              handle: r.handle,
              title: r.title,
              sku: r.sku,
              collectionName: r.collection_name,
              price: parseFloat(r.price),
              quantity: r.quantity,
              selectedSize: r.selected_size,
              selectedColor: r.selected_color,
              specSummary: r.spec_summary,
              image: r.image,
              imageAlt: r.image_alt,
            }));

            // Merge local guest items with remote saved items without duplicating
            setItems((prevLocal) => {
              const mergedMap = new Map<string, CartItem>();

              // Add remote items first
              mappedRemote.forEach((item) => {
                mergedMap.set(item.lineId, item);
              });

              // Merge local items: if exists, combine quantities; if not, add
              prevLocal.forEach((localItem) => {
                if (mergedMap.has(localItem.lineId)) {
                  const existing = mergedMap.get(localItem.lineId)!;
                  mergedMap.set(localItem.lineId, {
                    ...existing,
                    quantity: Math.max(existing.quantity, localItem.quantity),
                  });
                } else {
                  mergedMap.set(localItem.lineId, localItem);
                }
              });

              const mergedList = Array.from(mergedMap.values());
              // Save back merged state to Supabase
              syncWithSupabase(mergedList, userId);
              return mergedList;
            });

            setIsCartSyncing(false);
            return;
          }
        }

        // If no remote cart existed, upload current local items to Supabase
        await syncWithSupabase(items, userId);
      } catch (err) {
        console.error('Error during cart login merge:', err);
      } finally {
        setIsCartSyncing(false);
      }
    };

    if (user?.id && user.id !== previousUserId.current) {
      previousUserId.current = user.id;
      loadAndMergeSupabaseCart(user.id);
    } else if (!user && previousUserId.current) {
      previousUserId.current = null;
    }
  }, [user, syncWithSupabase, items]);

  const itemCount = isCustomEmptyOverride ? 0 : items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = isCustomEmptyOverride
    ? 0
    : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discount);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const addToCart = (
    product: Product,
    size = 'L',
    color?: string,
    quantity = 1,
    variantId?: string
  ) => {
    setIsCustomEmptyOverride(false);
    const chosenColor = color || (product.colors.length > 0 ? product.colors[0].name : 'ONYX');

    // Match variant from product if variantId not directly supplied
    const matchedVariant =
      product.variants?.length === 1 && product.variants[0].title.toLowerCase() === 'default title'
        ? product.variants[0]
        : product.variants?.find((v) => {
            const matchesSize =
              !size ||
              v.selectedOptions?.some(
                (o) => o.name.toLowerCase() === 'size' && o.value.toLowerCase() === size.toLowerCase()
              ) ||
              v.title.toLowerCase().includes(size.toLowerCase());

            const matchesColor =
              !chosenColor ||
              v.selectedOptions?.some(
                (o) =>
                  (o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour') &&
                  o.value.toLowerCase() === chosenColor.toLowerCase()
              ) ||
              v.title.toLowerCase().includes(chosenColor.toLowerCase());

            return matchesSize && matchesColor;
          }) || product.variants?.[0];

    const resolvedVariantId = variantId || matchedVariant?.id;
    const lineId = resolvedVariantId
      ? `line-${resolvedVariantId}`
      : `line-${product.id}-${size}-${chosenColor}`;

    const itemPrice = matchedVariant?.price || product.price;

    setItems((prev) => {
      let updated: CartItem[];
      const existing = prev.find((item) => item.lineId === lineId);
      if (existing) {
        updated = prev.map((item) =>
          item.lineId === lineId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const newItem: CartItem = {
          lineId,
          productId: product.id,
          variantId: resolvedVariantId,
          handle: product.handle,
          title: product.title,
          sku: matchedVariant?.sku || `${product.sku} // ${product.collectionTag || 'KAAZE'}`,
          collectionName: product.category.toUpperCase(),
          price: itemPrice,
          quantity,
          selectedSize: size,
          selectedColor: chosenColor,
          specSummary: product.gsm || product.specSummary || 'CUSTOM ARCHIVE WEAVE',
          image: matchedVariant?.image?.url || product.images[0]?.src || '',
          imageAlt: matchedVariant?.image?.altText || product.images[0]?.alt || product.title,
        };
        updated = [...prev, newItem];
      }

      if (user?.id) {
        syncWithSupabase(updated, user.id);
      }
      return updated;
    });
  };

  const createCheckoutUrl = async (customItems?: CartItem[]): Promise<string> => {
    try {
      const activeItems = customItems || items;
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: activeItems }),
      });
      const data = await res.json();
      if (data.checkoutUrl && data.checkoutUrl !== '/cart') {
        return data.checkoutUrl;
      }
      throw new Error(data.error || 'Failed to generate checkout URL');
    } catch (err) {
      console.error('Error in createCheckoutUrl:', err);
      throw err;
    }
  };

  const removeFromCart = (lineId: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.lineId !== lineId);
      if (user?.id) {
        syncWithSupabase(updated, user.id);
      }
      return updated;
    });
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((item) => (item.lineId === lineId ? { ...item, quantity } : item));
      if (user?.id) {
        syncWithSupabase(updated, user.id);
      }
      return updated;
    });
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'KAAZE10' || clean === 'ARCHIVE10') {
      setDiscountCode(clean);
      setDiscountPercent(10);
      return { success: true, message: `[ PROMO CODE APPLIED: 10% ARCHIVAL CREDIT ]` };
    }
    if (clean === 'KAAZE20') {
      setDiscountCode(clean);
      setDiscountPercent(20);
      return { success: true, message: `[ VIP ACCESS: 20% DISCOUNT APPLIED ]` };
    }
    return { success: false, message: `[ ERROR // INVALID OR EXPIRED PASSCODE ]` };
  };

  const removePromoCode = () => {
    setDiscountCode(null);
    setDiscountPercent(0);
  };

  const clearCart = () => {
    setItems([]);
    if (user?.id) {
      syncWithSupabase([], user.id);
    }
  };

  const populateDefaultCart = () => {
    setIsCustomEmptyOverride(false);
    setItems(DEFAULT_INITIAL_ITEMS);
    if (user?.id) {
      syncWithSupabase(DEFAULT_INITIAL_ITEMS, user.id);
    }
  };

  const toggleMockState = (target: 'populated' | 'empty') => {
    if (target === 'empty') {
      setIsCustomEmptyOverride(true);
    } else {
      setIsCustomEmptyOverride(false);
      if (items.length === 0) {
        populateDefaultCart();
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: isCustomEmptyOverride ? [] : items,
        itemCount,
        subtotal,
        discount,
        discountCode,
        total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        shippingRemaining,
        hasFreeShipping,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyPromoCode,
        removePromoCode,
        clearCart,
        populateDefaultCart,
        isCustomEmptyOverride,
        toggleMockState,
        isCartSyncing,
        createCheckoutUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
