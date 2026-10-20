import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem } from '@/types';
import { getSupabase } from '@/lib/supabase';
import { getShopifyDomain } from '@/lib/shopify';

const rawStoreDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const SHOPIFY_STORE_DOMAIN = rawStoreDomain.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || '';
const SHOPIFY_API_VERSION = '2024-04';

const isShopifyAdminConfigured: boolean = Boolean(
  SHOPIFY_STORE_DOMAIN &&
  SHOPIFY_ADMIN_API_ACCESS_TOKEN &&
  !SHOPIFY_STORE_DOMAIN.includes('your-store-name') &&
  !SHOPIFY_ADMIN_API_ACCESS_TOKEN.includes('your_admin_api_access_token')
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required for order synchronization', configured: isShopifyAdminConfigured, orders: [] },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  let existingSupabaseOrders: Order[] = [];

  // 1. Fetch any orders already synchronized in Supabase orders table
  if (supabase) {
    try {
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (dbOrders && dbOrders.length > 0) {
        existingSupabaseOrders = dbOrders.map((row: any) => ({
          id: row.id,
          orderNumber: row.order_number,
          date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
          status: row.status,
          customerEmail: row.customer_email,
          items: Array.isArray(row.items) ? row.items : [],
          subtotal: parseFloat(row.subtotal || 0),
          shipping: parseFloat(row.shipping || 0),
          discount: parseFloat(row.discount || 0),
          total: parseFloat(row.total || 0),
          itemsCount: row.items_count || 0,
          shippingAddress: row.shipping_address || {
            name: '',
            street: '',
            city: 'MANGALURU',
            country: 'INDIA',
            postalCode: '',
          },
          timeline: Array.isArray(row.timeline) ? row.timeline : [],
        }));
      }
    } catch (dbErr) {
      console.warn('Notice: Could not read Supabase orders table:', dbErr);
    }
  }

  // 2. If Shopify Admin API credentials are not yet configured on server
  if (!isShopifyAdminConfigured) {
    return NextResponse.json({
      configured: false,
      orders: existingSupabaseOrders,
      message: 'Shopify Admin API is pending configuration. Real orders will synchronize automatically once connected.',
    });
  }

  // 3. Query Shopify Admin API for fresh orders
  const query = `
    query getCustomerOrders($query: String!) {
      orders(first: 20, query: $query, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFulfillmentStatus
            cancelledAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
              }
            }
            totalShippingPriceSet {
              shopMoney {
                amount
              }
            }
            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  sku
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                  variant {
                    title
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
            shippingAddress {
              name
              address1
              city
              country
              zip
            }
          }
        }
      }
    }
  `;

  try {
    const activeDomain = getShopifyDomain() || SHOPIFY_STORE_DOMAIN;
    const endpoint = `https://${activeDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { query: `email:${email}` },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Shopify Admin API responded with status ${response.status}`);
    }

    const data = await response.json();
    const edges = data?.data?.orders?.edges || [];

    const shopifyOrders: Order[] = edges.map(({ node }: any) => {
      const items: OrderItem[] = (node.lineItems?.edges || []).map(({ node: item }: any) => ({
        id: item.id,
        title: item.title,
        sku: item.sku || 'KAAZE // CORE',
        price: parseFloat(item.originalUnitPriceSet?.shopMoney?.amount || '0'),
        quantity: item.quantity,
        color: item.variant?.title?.split('/')?.[1]?.trim() || 'STANDARD',
        size: item.variant?.title?.split('/')?.[0]?.trim() || 'OS',
        image: item.variant?.image?.url || '',
        imageAlt: item.variant?.image?.altText || item.title,
      }));

      let status: Order['status'] = 'PROCESSING';
      if (node.cancelledAt) {
        status = 'CANCELLED';
      } else if (node.displayFulfillmentStatus === 'FULFILLED') {
        status = 'DELIVERED';
      } else if (node.displayFulfillmentStatus === 'IN_TRANSIT') {
        status = 'IN TRANSIT';
      }

      const total = parseFloat(node.totalPriceSet?.shopMoney?.amount || '0');
      const subtotal = parseFloat(node.subtotalPriceSet?.shopMoney?.amount || '0');
      const shipping = parseFloat(node.totalShippingPriceSet?.shopMoney?.amount || '0');

      return {
        id: node.id,
        orderNumber: node.name.replace('#', ''),
        date: new Date(node.createdAt).toISOString().split('T')[0],
        status,
        customerEmail: email,
        items,
        subtotal,
        shipping,
        discount: 0,
        total,
        itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
        shippingAddress: {
          name: node.shippingAddress?.name || '',
          street: node.shippingAddress?.address1 || '',
          city: node.shippingAddress?.city || '',
          country: node.shippingAddress?.country || 'INDIA',
          postalCode: node.shippingAddress?.zip || '',
        },
        timeline: [
          {
            status: 'ORDER_PLACED',
            label: 'Order Confirmed',
            date: new Date(node.createdAt).toISOString().split('T')[0],
            completed: true,
            current: status === 'PROCESSING',
          },
        ],
      };
    });

    // 4. Optionally synchronize fresh Shopify orders to Supabase orders table
    if (supabase && shopifyOrders.length > 0) {
      try {
        const rowsToUpsert = shopifyOrders.map((o) => ({
          shopify_order_id: o.id,
          order_number: o.orderNumber,
          customer_email: o.customerEmail,
          status: o.status,
          total: o.total,
          subtotal: o.subtotal,
          shipping: o.shipping,
          discount: o.discount,
          items_count: o.itemsCount,
          items: o.items,
          shipping_address: o.shippingAddress,
          timeline: o.timeline,
          updated_at: new Date().toISOString(),
        }));

        await supabase.from('orders').upsert(rowsToUpsert, { onConflict: 'shopify_order_id' });
      } catch (upsertErr) {
        console.warn('Notice: Could not persist synced orders to Supabase:', upsertErr);
      }
    }

    return NextResponse.json({
      configured: true,
      orders: shopifyOrders.length > 0 ? shopifyOrders : existingSupabaseOrders,
    });
  } catch (error) {
    console.error('Failed to retrieve Shopify customer orders:', error);
    return NextResponse.json({
      configured: true,
      orders: existingSupabaseOrders,
      error: 'Unable to communicate with Shopify API; showing cached Supabase orders if available.',
    });
  }
}
