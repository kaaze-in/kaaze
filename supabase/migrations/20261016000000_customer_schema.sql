-- ==============================================================================
-- KAAZE EDTN — Supabase Customer Accounts, Saved Carts & Orders Schema
-- Migration: 20261016000000_customer_schema.sql
-- ==============================================================================

-- 1. CUSTOMER PROFILES TABLE
-- Linked 1:1 with Supabase Auth users (auth.users.id)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text default '',
  last_name text default '',
  email text,
  phone text default '',
  shipping_address jsonb default '{
    "name": "",
    "street": "",
    "city": "",
    "country": "INDIA",
    "postal_code": "",
    "coordinates": "12.9141° N, 74.8560° E"
  }'::jsonb,
  sizing_matrix jsonb default '{
    "chest": "STANDARD",
    "waist": "STANDARD",
    "inseam": "STANDARD",
    "footwear": "STANDARD",
    "preferredFit": "RELAXED"
  }'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.profiles is 'Stores customer profile details, shipping location, and sizing calibrations associated with Supabase Auth identities.';

-- 2. SAVED CUSTOMER CARTS TABLE
-- Provides cross-device cart persistence associated with verified Supabase customer ID
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.carts is 'Holds the active saved cart container for an authenticated customer.';

-- 3. SAVED CART ITEMS TABLE
-- Stores individual line items contained in a customer cart
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  line_id text not null,
  product_id text not null,
  handle text not null,
  title text not null,
  sku text default '',
  collection_name text default '',
  price numeric(10, 2) not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  selected_size text default '',
  selected_color text default '',
  spec_summary text default '',
  image text default '',
  image_alt text default '',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_cart_item unique (cart_id, line_id)
);

comment on table public.cart_items is 'Itemized lines within an authenticated customer cart.';

-- 4. CUSTOMER ORDERS TABLE
-- Stores customer order records synchronized securely from Shopify
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  shopify_order_id text unique,
  order_number text not null,
  customer_email text not null,
  status text not null default 'PROCESSING' check (status in ('PROCESSING', 'IN TRANSIT', 'DELIVERED', 'CANCELLED')),
  financial_status text default 'PAID',
  fulfillment_status text default 'UNFULFILLED',
  currency text default 'INR',
  total numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null default 0,
  shipping numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  items_count integer not null default 0,
  items jsonb not null default '[]'::jsonb,
  shipping_address jsonb default '{}'::jsonb,
  timeline jsonb default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.orders is 'Stores customer order records synchronized securely from Shopify.';

-- 5. PERFORMANCE INDEXES
create index if not exists idx_profiles_id on public.profiles(id);
create index if not exists idx_carts_user_id on public.carts(user_id);
create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);
create index if not exists idx_cart_items_product_id on public.cart_items(product_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_customer_email on public.orders(customer_email);
create index if not exists idx_orders_shopify_order_id on public.orders(shopify_order_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;

-- Profiles Policies
create policy "Customers can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Customers can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Customers can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Carts Policies
create policy "Customers can read own cart"
  on public.carts
  for select
  using (auth.uid() = user_id);

create policy "Customers can insert own cart"
  on public.carts
  for insert
  with check (auth.uid() = user_id);

create policy "Customers can update own cart"
  on public.carts
  for update
  using (auth.uid() = user_id);

create policy "Customers can delete own cart"
  on public.carts
  for delete
  using (auth.uid() = user_id);

-- Cart Items Policies
create policy "Customers can read own cart items"
  on public.cart_items
  for select
  using (
    cart_id in (select id from public.carts where user_id = auth.uid())
  );

create policy "Customers can insert own cart items"
  on public.cart_items
  for insert
  with check (
    cart_id in (select id from public.carts where user_id = auth.uid())
  );

create policy "Customers can update own cart items"
  on public.cart_items
  for update
  using (
    cart_id in (select id from public.carts where user_id = auth.uid())
  );

create policy "Customers can delete own cart items"
  on public.cart_items
  for delete
  using (
    cart_id in (select id from public.carts where user_id = auth.uid())
  );

-- Orders Policies: Customers can only read orders associated with their account
create policy "Customers can read own orders"
  on public.orders
  for select
  using (
    auth.uid() = user_id or
    customer_email = (select email from auth.users where id = auth.uid())
  );

create policy "Service role and server can insert orders"
  on public.orders
  for insert
  with check (true);

create policy "Service role and server can update orders"
  on public.orders
  for update
  using (true);

-- 7. AUTOMATIC TRIGGER FOR NEW USER REGISTRATION
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email, shipping_address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    jsonb_build_object(
      'name', trim(concat(coalesce(new.raw_user_meta_data->>'first_name', ''), ' ', coalesce(new.raw_user_meta_data->>'last_name', ''))),
      'street', '',
      'city', 'MANGALURU',
      'country', 'INDIA',
      'postal_code', '',
      'coordinates', '12.9141° N, 74.8560° E'
    )
  )
  on conflict (id) do nothing;

  -- Also link any previously unlinked orders matching this customer email
  update public.orders
  set user_id = new.id
  where customer_email = new.email and user_id is null;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
