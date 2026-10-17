import { Product, ProductColor, ProductImage, ProductVariant, Order, CustomerProfile } from '@/types';
import { PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMER } from './data';

// -----------------------------------------------------------------------------
// Configuration & Helpers
// -----------------------------------------------------------------------------

export function getShopifyDomain(): string {
  const raw = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
  return raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
}

export function getShopifyStorefrontToken(): string {
  return (process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '').trim();
}

export const SHOPIFY_API_VERSION = '2024-04';

export const isShopifyConfigured: boolean = Boolean(
  getShopifyDomain() &&
  getShopifyStorefrontToken() &&
  !getShopifyDomain().includes('your-store-name') &&
  !getShopifyStorefrontToken().includes('your_token') &&
  getShopifyStorefrontToken().length >= 10
);

// Map common color names to clean hex values for UI swatches
const COLOR_HEX_MAP: Record<string, string> = {
  black: '#0A0A0A',
  onyx: '#141414',
  'matte black': '#171717',
  'washed onyx': '#222222',
  charcoal: '#2B2B2B',
  white: '#FFFFFF',
  bone: '#EFEFEF',
  raw: '#E8E4D9',
  cream: '#F5F5DC',
  grey: '#737373',
  gray: '#737373',
  slate: '#525252',
  silver: '#C0C0C0',
  navy: '#0F172A',
  olive: '#3F4436',
  khaki: '#786C5A',
  sand: '#D4C4B5',
  tan: '#A79075',
  brown: '#4A3B32',
  espresso: '#2B1E17',
};

function getColorHex(name: string): string {
  const lower = name.toLowerCase().trim();
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return '#1A1A1A';
}

/**
 * Categorize Shopify products into the four existing KAAZE categories:
 * 'clothing' | 'shoes' | 'watches' | 'accessories'
 */
export function determineCategory(
  productType = '',
  tags: string[] = [],
  title = ''
): 'clothing' | 'shoes' | 'watches' | 'accessories' {
  const combined = `${productType} ${tags.join(' ')} ${title}`.toLowerCase();

  // 1. Watches
  if (
    combined.includes('watch') ||
    combined.includes('timepiece') ||
    combined.includes('chronograph') ||
    combined.includes('horology')
  ) {
    return 'watches';
  }

  // 2. Shoes & Footwear
  if (
    combined.includes('shoe') ||
    combined.includes('sneaker') ||
    combined.includes('boot') ||
    combined.includes('footwear') ||
    combined.includes('derby') ||
    combined.includes('loafer') ||
    combined.includes('slide') ||
    combined.includes('mule')
  ) {
    return 'shoes';
  }

  // 3. Accessories
  if (
    combined.includes('accessory') ||
    combined.includes('accessories') ||
    combined.includes('bag') ||
    combined.includes('tote') ||
    combined.includes('backpack') ||
    combined.includes('crossbody') ||
    combined.includes('harness') ||
    combined.includes('hat') ||
    combined.includes('cap') ||
    combined.includes('beanie') ||
    combined.includes('belt') ||
    combined.includes('wallet') ||
    combined.includes('cardholder') ||
    combined.includes('sunglasses') ||
    combined.includes('eyewear') ||
    combined.includes('jewelry') ||
    combined.includes('ring') ||
    combined.includes('necklace') ||
    combined.includes('bracelet') ||
    combined.includes('scarf') ||
    combined.includes('gloves')
  ) {
    return 'accessories';
  }

  // 4. Default: Clothing (hoodie, tee, shirt, jacket, parka, coat, knit, cargo, pants, denim)
  return 'clothing';
}

// -----------------------------------------------------------------------------
// GraphQL Queries
// -----------------------------------------------------------------------------

const PRODUCTS_GRAPHQL_QUERY = `
  query getProducts($first: Int = 100, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          productType
          tags
          vendor
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          options {
            id
            name
            values
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_GRAPHQL_QUERY = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      productType
      tags
      vendor
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 20) {
        edges {
          node {
            url
            altText
          }
        }
      }
      options {
        id
        name
        values
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// -----------------------------------------------------------------------------
// Generic Fetcher
// -----------------------------------------------------------------------------

export async function shopifyFetch<T>({
  query,
  variables,
  revalidate = 60,
}: {
  query: string;
  variables?: Record<string, unknown>;
  revalidate?: number;
}): Promise<{ data: T | null; error?: string }> {
  const domain = getShopifyDomain();
  const token = getShopifyStorefrontToken();

  if (!domain || !token || token.length < 10) {
    return { data: null, error: 'Shopify Storefront credentials are incomplete or pending.' };
  }

  const endpoint = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });

    if (!response.ok) {
      const errText = await response.text();
      return { data: null, error: `Shopify HTTP ${response.status}: ${errText}` };
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      const msg = json.errors.map((e: { message: string }) => e.message).join('; ');
      return { data: null, error: msg || 'Shopify GraphQL error' };
    }

    return { data: json.data as T };
  } catch (err: unknown) {
    return { data: null, error: (err as Error)?.message || 'Failed to fetch from Shopify Storefront API' };
  }
}

// -----------------------------------------------------------------------------
// Shopify Product Node Transformer
// -----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformShopifyProduct(node: any): Product {
  const price = parseFloat(node.priceRange?.minVariantPrice?.amount || '0');
  const compareAtPrice = node.compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
    : undefined;

  let discountBadge: string | undefined;
  if (compareAtPrice && compareAtPrice > price) {
    const pct = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
    discountBadge = `-${pct}%`;
  }

  // Format images
  const images: ProductImage[] = (node.images?.edges || []).map((e: { node: { url: string; altText?: string } }, idx: number) => ({
    src: e.node.url,
    alt: e.node.altText || `${node.title} - Studio spec 0${idx + 1}`,
    viewLabel: `VIEW // 0${idx + 1}`,
    indexTag: `0${idx + 1}`,
  }));

  if (images.length === 0) {
    images.push({
      src: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      alt: node.title,
      viewLabel: 'VIEW // 01',
      indexTag: '01',
    });
  }

  // Extract variants
  const variants: ProductVariant[] = (node.variants?.edges || []).map((e: {
    node: {
      id: string;
      title: string;
      sku?: string;
      availableForSale: boolean;
      price: { amount: string };
      compareAtPrice?: { amount: string };
      selectedOptions?: { name: string; value: string }[];
      image?: { url: string; altText?: string };
    };
  }) => ({
    id: e.node.id,
    title: e.node.title,
    sku: e.node.sku || undefined,
    price: parseFloat(e.node.price?.amount || '0'),
    compareAtPrice: e.node.compareAtPrice ? parseFloat(e.node.compareAtPrice.amount) : undefined,
    available: Boolean(e.node.availableForSale),
    selectedOptions: e.node.selectedOptions,
    image: e.node.image,
  }));

  // Extract color options
  const colorOption = (node.options || []).find(
    (o: { name: string; values: string[] }) =>
      o.name.toLowerCase() === 'color' ||
      o.name.toLowerCase() === 'colour' ||
      o.name.toLowerCase() === 'colorway'
  );
  let colors: ProductColor[] = [];
  if (colorOption && colorOption.values?.length > 0) {
    colors = colorOption.values.map((v: string) => {
      const hex = getColorHex(v);
      return { name: v.toUpperCase(), hex, swatchBg: hex };
    });
  } else {
    colors = [{ name: 'ONYX', hex: '#0A0A0A', swatchBg: '#0A0A0A' }];
  }

  // Extract size options
  const sizeOption = (node.options || []).find(
    (o: { name: string; values: string[] }) =>
      o.name.toLowerCase() === 'size' ||
      o.name.toLowerCase() === 'sizing' ||
      o.name.toLowerCase() === 'dimension'
  );
  let sizes: string[] = [];
  if (sizeOption && sizeOption.values?.length > 0) {
    sizes = sizeOption.values.map((v: string) => v.toUpperCase());
  } else if (variants.length > 0) {
    sizes = Array.from(new Set(variants.map((v) => v.title.toUpperCase())));
  }
  if (sizes.length === 0) {
    sizes = ['OS'];
  }

  const category = determineCategory(node.productType, node.tags || [], node.title);
  const firstVariantSku = variants[0]?.sku;

  return {
    id: node.id,
    handle: node.handle,
    sku: firstVariantSku || `KZ-${node.handle.slice(0, 4).toUpperCase()}`,
    title: node.title,
    subtitle: node.vendor ? `${node.vendor.toUpperCase()} ARCHIVE` : 'KAAZE EDTN',
    description: node.description || 'Architectural precision in everyday staples.',
    synopsis: node.description?.slice(0, 140) || 'Distinctive contemporary find curated by KAAZE.',
    price,
    compareAtPrice,
    discountBadge,
    category,
    collectionTag: node.productType ? node.productType.toUpperCase() : 'CORE EDTN',
    seriesTag: 'KAAZE // STOREFRONT',
    stockStatus: node.availableForSale ? 'ALLOCATION ACTIVE' : 'ARCHIVED // SOLD OUT',
    inStock: Boolean(node.availableForSale),
    gsm: node.tags?.find((t: string) => t.toLowerCase().includes('gsm')) || undefined,
    specSummary: node.productType ? `${node.productType.toUpperCase()}` : 'CURATED SPEC',
    images,
    colors,
    sizes,
    specs: {
      origin: 'GLOBAL SOURCING',
      fit: 'SIGNATURE RELAXED',
      finish: 'MATTE FINISH',
      material: node.productType || 'PREMIUM TEXTILE',
    },
    variants,
  };
}

// -----------------------------------------------------------------------------
// Public Services
// -----------------------------------------------------------------------------

/**
 * Fetch all products from Shopify Storefront API.
 * Gracefully falls back to curated mock data if Shopify credentials are not yet active.
 */
export async function getProducts(category?: string): Promise<Product[]> {
  try {
    const res = await shopifyFetch<{
      products: { edges: { node: unknown }[] };
    }>({
      query: PRODUCTS_GRAPHQL_QUERY,
    });

    if (res.data?.products?.edges && res.data.products.edges.length > 0) {
      const liveProducts = res.data.products.edges.map((e) => transformShopifyProduct(e.node));
      if (category && category !== 'all') {
        return liveProducts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      return liveProducts;
    }
  } catch (err) {
    console.warn('Shopify products fetch failed, using fallback catalogue:', err);
  }

  // Graceful fallback to preserve UI when Shopify Storefront token is pending
  if (category && category !== 'all') {
    return PRODUCTS.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  return PRODUCTS;
}

/**
 * Fetch a single product by handle from Shopify Storefront API.
 */
export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  const cleanHandle = handle.toLowerCase().trim();

  try {
    const res = await shopifyFetch<{
      product: unknown;
    }>({
      query: PRODUCT_BY_HANDLE_GRAPHQL_QUERY,
      variables: { handle: cleanHandle },
    });

    if (res.data?.product) {
      return transformShopifyProduct(res.data.product);
    }
  } catch (err) {
    console.warn(`Shopify product handle "${cleanHandle}" fetch note:`, err);
  }

  // Fallback to local catalog
  return PRODUCTS.find((p) => p.handle.toLowerCase() === cleanHandle);
}

/**
 * Complementary products recommender
 */
export async function getComplementaryProducts(handles?: string[]): Promise<Product[]> {
  const all = await getProducts();
  if (!handles || handles.length === 0) {
    return all.slice(0, 4);
  }
  const matched = all.filter((p) => handles.includes(p.handle));
  if (matched.length < 4) {
    const remaining = all.filter((p) => !handles.includes(p.handle));
    return [...matched, ...remaining].slice(0, 4);
  }
  return matched.slice(0, 4);
}

/**
 * Creates a Shopify checkout URL via the Storefront API `cartCreate` mutation.
 * If credentials are not configured or line items do not have GIDs, builds a permalink URL.
 */
export async function createShopifyCheckout(
  lines: { variantId: string; quantity: number }[]
): Promise<{ checkoutUrl: string; error?: string }> {
  const domain = getShopifyDomain();

  if (!lines || lines.length === 0) {
    return { checkoutUrl: '/cart', error: 'No items in cart' };
  }

  // 1. Attempt Storefront API cartCreate mutation
  if (isShopifyConfigured) {
    try {
      // Format lines with GID if not already formatted
      const formattedLines = lines.map((l) => {
        let merchandiseId = l.variantId;
        if (/^\d+$/.test(merchandiseId)) {
          merchandiseId = `gid://shopify/ProductVariant/${merchandiseId}`;
        }
        return {
          merchandiseId,
          quantity: l.quantity,
        };
      });

      const res = await shopifyFetch<{
        cartCreate: {
          cart?: { id: string; checkoutUrl: string };
          userErrors?: { field: string; message: string }[];
        };
      }>({
        query: CART_CREATE_MUTATION,
        variables: {
          input: {
            lines: formattedLines,
          },
        },
      });

      if (res.data?.cartCreate?.cart?.checkoutUrl) {
        return { checkoutUrl: res.data.cartCreate.cart.checkoutUrl };
      }

      if (res.data?.cartCreate?.userErrors && res.data.cartCreate.userErrors.length > 0) {
        console.warn('Shopify cartCreate userErrors:', res.data.cartCreate.userErrors);
      }
    } catch (apiErr) {
      console.warn('Shopify cartCreate mutation note:', apiErr);
    }

    // 2. Fallback to Shopify Cart Permalink (standard fallback)
    if (domain) {
      const permalinkParts = lines
        .map((l) => {
          const numId = l.variantId.replace(/\D/g, '') || l.variantId;
          return `${numId}:${l.quantity}`;
        })
        .join(',');
      return { checkoutUrl: `https://${domain}/cart/${permalinkParts}` };
    }
  }

  // 3. Fallback when credentials are still in preparation mode
  return { checkoutUrl: '/cart?simulated_checkout=true' };
}

export async function createCheckoutUrl(
  lineItems: { variantId: string; quantity: number }[]
): Promise<string> {
  const res = await createShopifyCheckout(lineItems);
  return res.checkoutUrl;
}

/**
 * Order Tracking Service (preserved)
 */
export async function lookupOrder(orderQuery: string, contactQuery: string): Promise<Order | null> {
  const cleanOrderNum = orderQuery.replace(/^#/, '').trim().toUpperCase();
  const cleanContact = contactQuery.trim().toLowerCase();

  const found = MOCK_ORDERS.find((o) => {
    const matchNum = o.orderNumber.replace(/^#/, '').toUpperCase() === cleanOrderNum;
    const matchEmail = o.customerEmail.toLowerCase() === cleanContact;
    const matchPhone = o.customerPhone?.replace(/\s+/g, '') === cleanContact.replace(/\s+/g, '');
    return matchNum && (matchEmail || matchPhone || cleanContact === '');
  });

  return found || null;
}

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return MOCK_CUSTOMER;
}
