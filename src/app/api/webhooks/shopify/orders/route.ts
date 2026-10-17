import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabase } from '@/lib/supabase';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';

/**
 * Validates HMAC-SHA256 signature from Shopify webhook header
 */
function verifyShopifyHmac(body: string, hmacHeader: string | null): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET || !hmacHeader) return true; // Bypass in local development if secret unconfigured
  const hash = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const hmac = request.headers.get('x-shopify-hmac-sha256');

    if (SHOPIFY_WEBHOOK_SECRET && !verifyShopifyHmac(rawBody, hmac)) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ message: 'Supabase client pending configuration' }, { status: 200 });
    }

    const customerEmail = payload.email || payload.customer?.email;
    if (!customerEmail) {
      return NextResponse.json({ message: 'Order without email skipped' }, { status: 200 });
    }

    // Attempt to locate matching user_id from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle();

    const userId = profile?.id || null;

    let status = 'PROCESSING';
    if (payload.cancelled_at) {
      status = 'CANCELLED';
    } else if (payload.fulfillment_status === 'fulfilled') {
      status = 'DELIVERED';
    } else if (payload.fulfillment_status === 'partial') {
      status = 'IN TRANSIT';
    }

    const items = (payload.line_items || []).map((li: any) => ({
      id: String(li.id),
      title: li.title,
      sku: li.sku || 'KAAZE // CORE',
      price: parseFloat(li.price || '0'),
      quantity: li.quantity || 1,
      color: li.variant_title?.split('/')?.[1]?.trim() || 'STANDARD',
      size: li.variant_title?.split('/')?.[0]?.trim() || 'OS',
      image: '',
      imageAlt: li.title,
    }));

    const orderRow = {
      shopify_order_id: String(payload.id),
      order_number: String(payload.order_number || payload.name?.replace('#', '') || payload.id),
      user_id: userId,
      customer_email: customerEmail,
      status,
      financial_status: payload.financial_status || 'PAID',
      fulfillment_status: payload.fulfillment_status || 'UNFULFILLED',
      currency: payload.currency || 'INR',
      total: parseFloat(payload.total_price || '0'),
      subtotal: parseFloat(payload.subtotal_price || '0'),
      shipping: parseFloat(payload.total_shipping_price_set?.shop_money?.amount || '0'),
      discount: parseFloat(payload.total_discounts || '0'),
      items_count: items.reduce((sum: number, it: any) => sum + it.quantity, 0),
      items,
      shipping_address: payload.shipping_address || {},
      timeline: [
        {
          status: 'ORDER_PLACED',
          label: 'Order Confirmed',
          date: payload.created_at ? new Date(payload.created_at).toISOString().split('T')[0] : '',
          completed: true,
          current: status === 'PROCESSING',
        },
      ],
      updated_at: new Date().toISOString(),
    };

    await supabase.from('orders').upsert(orderRow, { onConflict: 'shopify_order_id' });

    return NextResponse.json({ success: true, orderNumber: orderRow.order_number });
  } catch (err: any) {
    console.error('Shopify order webhook error:', err);
    return NextResponse.json({ error: err?.message || 'Webhook processing error' }, { status: 500 });
  }
}
