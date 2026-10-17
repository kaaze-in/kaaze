import React from 'react';
import { notFound } from 'next/navigation';
import { getProductByHandle, getComplementaryProducts, getProducts } from '@/lib/shopify';
import { ProductDetailClient } from './ProductDetailClient';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: {
    handle: string;
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({
    handle: p.handle,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductByHandle(params.handle);
  if (!product) {
    return {
      title: 'Artifact Not Found — KAAZE',
    };
  }
  return {
    title: `${product.title} — KAAZE`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductByHandle(params.handle);

  if (!product) {
    notFound();
  }

  const related = await getComplementaryProducts(product.complementaryHandles);

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
