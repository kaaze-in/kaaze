export interface ProductImage {
  src: string;
  alt: string;
  viewLabel?: string;
  indexTag?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
  swatchBg?: string;
}

export interface ProductSpec {
  material?: string;
  weave?: string;
  collar?: string;
  finish?: string;
  origin?: string;
  weight?: string;
  fit?: string;
  dye?: string;
  closure?: string;
  sole?: string;
  movement?: string;
  powerReserve?: string;
  crystal?: string;
  waterResistance?: string;
  buckle?: string;
  gauge?: string;
  [key: string]: string | undefined | Record<string, string>;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  selectedOptions?: { name: string; value: string }[];
  image?: { url: string; altText?: string };
}

export interface Product {
  id: string;
  handle: string;
  sku: string;
  title: string;
  subtitle?: string;
  description: string;
  synopsis?: string;
  price: number;
  compareAtPrice?: number;
  discountBadge?: string;
  category: 'clothing' | 'shoes' | 'watches' | 'accessories';
  collectionTag?: string;
  seriesTag?: string;
  stockStatus: string;
  inStock: boolean;
  gsm?: string;
  specSummary?: string;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: string[];
  specs: ProductSpec;
  variants?: ProductVariant[];
  complementaryHandles?: string[];
}

export interface CartItem {
  lineId: string;
  productId: string;
  variantId?: string;
  handle: string;
  title: string;
  sku: string;
  collectionName: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  specSummary: string;
  image: string;
  imageAlt: string;
}

export interface OrderItem {
  id: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
  imageAlt: string;
}

export interface OrderTimelineStep {
  status: string;
  label: string;
  date: string;
  time?: string;
  location?: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'IN TRANSIT' | 'DELIVERED' | 'PROCESSING' | 'CANCELLED';
  waybill?: string;
  carrier?: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemsCount: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
    coordinates?: string;
  };
  remarks?: string;
  timeline: OrderTimelineStep[];
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  node: string;
  totalDrops: number;
  lifetimeValue: string;
  sizingMatrix: {
    chest: string;
    waist: string;
    inseam: string;
    footwear: string;
    preferredFit: string;
  };
  primaryAddress: {
    name: string;
    street: string;
    city: string;
    country: string;
    coordinates: string;
  };
  credentials: {
    email: string;
    phone: string;
    passwordMasked: string;
    twoFactorEnabled: boolean;
  };
}
