'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function PurchaseTermsSection() {
  const [agreed, setAgreed] = useState<boolean>(false);

  return (
    <div className="bg-surface-container-low border-2 border-primary p-space-md md:p-space-lg flex flex-col space-y-space-md">
      <div className="flex items-center justify-between border-b border-surface-container pb-2 font-mono">
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
          [ PURCHASE TERMS DIRECTIVE ]
        </span>
        <span className="font-label-sm text-label-sm text-outline uppercase">
          ACKNOWLEDGEMENT REQUIRED
        </span>
      </div>

      <div className="space-y-space-xs">
        <h2 className="text-primary font-bold text-headline-md font-sans uppercase">
          BEFORE YOU PROCEED
        </h2>
        <p className="text-on-surface-variant font-body-md font-sans leading-relaxed">
          Please review our purchase terms before placing your order.
        </p>
      </div>

      <ul className="space-y-3 font-sans font-body-md text-on-surface-variant border-y border-surface-container py-space-md">
        <li className="flex items-start gap-2.5">
          <span className="text-primary font-mono font-bold leading-normal">•</span>
          <span>
            <strong className="text-primary font-semibold">No returns or exchanges:</strong>{' '}
            Purchases are final, subject to applicable consumer rights.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="text-primary font-mono font-bold leading-normal">•</span>
          <span>
            <strong className="text-primary font-semibold">Product details:</strong>{' '}
            Review the description, size, specifications, and images carefully before ordering.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="text-primary font-mono font-bold leading-normal">•</span>
          <span>
            <strong className="text-primary font-semibold">Third-party fulfilment:</strong>{' '}
            Products may be sourced and shipped by external suppliers or logistics partners.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="text-primary font-mono font-bold leading-normal">•</span>
          <span>
            <strong className="text-primary font-semibold">Delivery:</strong>{' '}
            Delivery estimates may vary depending on the supplier and courier.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="text-primary font-mono font-bold leading-normal">•</span>
          <span>
            <strong className="text-primary font-semibold">Order confirmation:</strong>{' '}
            Verify your shipping address and contact information before completing payment.
          </span>
        </li>
      </ul>

      {/* Checkbox Acknowledgment */}
      <div className="pt-space-xs">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded-none border-primary text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
          />
          <span className="text-primary font-mono text-label-md uppercase tracking-wide font-medium">
            I have read and understood the purchase terms and no-return policy.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="pt-space-sm flex flex-col sm:flex-row items-center gap-space-sm font-mono font-label-md text-label-md uppercase tracking-widest">
        {agreed ? (
          <Link
            href="/cart"
            className="w-full sm:w-auto text-center px-6 py-3 bg-primary text-on-primary hover:bg-surface-container-high hover:text-primary transition-colors font-bold border border-primary"
          >
            [ CONTINUE TO CHECKOUT ]
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto text-center px-6 py-3 bg-surface-container text-outline opacity-60 cursor-not-allowed font-bold border border-surface-container"
          >
            [ CONTINUE TO CHECKOUT ]
          </button>
        )}
        <Link
          href="/shop"
          className="w-full sm:w-auto text-center px-6 py-3 border border-surface-container hover:border-primary text-on-surface hover:text-primary transition-colors font-semibold"
        >
          [ CANCEL ]
        </Link>
      </div>
    </div>
  );
}
