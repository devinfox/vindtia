# VINDTIA

**Luxury Vintage Fashion Rental Platform**

A full-stack Next.js application for renting curated archive-level vintage fashion pieces with tier-based membership access.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (Postgres)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Styling:** Tailwind CSS

---

## Features

### Authentication & Profiles
- Email/password signup and login
- Automatic profile creation on signup
- Protected routes with tier-based access control
- User dashboard

### Membership System (Stripe Integration)
- 4 membership tiers (Free, Tier 1, Tier 2, Tier 3)
- Stripe Checkout integration
- Automatic tier updates via webhooks
- Stripe Customer Portal for subscription management
- Dedicated membership management page

### Product Catalog
- Designer management
- Product listings with images
- Tier-based product visibility (RLS enforced)
- Product detail pages with image galleries
- Inventory tracking
- Archive/active status

### Storefront
- Public browsing (tier-restricted)
- Filter by designer
- Product detail pages
- Rental availability display

### Admin Dashboard
- Admin-only access (role-based)
- Full CRUD for designers
- Full CRUD for products with media management
- Orders overview
- Stats dashboard

### User Dashboard
- Membership tier display
- Active/past rentals
- Order history
- Quick access to upgrade

---

## Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_TIER1_PRICE_ID=price_...
STRIPE_TIER2_PRICE_ID=price_...
STRIPE_TIER3_PRICE_ID=price_...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Database Setup

Run the Supabase migration:

```bash
cd supabase
supabase db push
```

This creates all tables, RLS policies, indexes, and triggers.

### 3. Stripe Setup

1. Create 3 recurring products in Stripe Dashboard
2. Add metadata to each price:
   - `tier_number`: `1`, `2`, or `3`
   - `type`: `"membership"`
3. Copy price IDs to `.env.local`
4. Configure webhook endpoint: `https://your-domain.com/api/stripe/webhook`
5. Subscribe to events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`

### 4. Create First Admin User

After signing up, get your user ID and run in Supabase SQL Editor:

```sql
INSERT INTO admin_roles (user_id, role)
VALUES ('your-user-id-here', 'super_admin');
```

### 5. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## Routes

### Public
- `/` - Landing page
- `/storefront` - Product catalog (tier-gated)
- `/storefront/product/[id]` - Product detail

### Auth
- `/auth/login` - Login
- `/auth/signup` - Sign up

### User (Authenticated)
- `/dashboard` - User dashboard
- `/membership` - Membership management
- `/upgrade` - Upgrade to higher tier
- `/success` - Post-checkout success

### Admin (Admin Role Required)
- `/admin` - Admin dashboard
- `/admin/designers` - Designers CRUD
- `/admin/products` - Products CRUD
- `/admin/orders` - Orders list

---

## Key Features

### Tier-Based Access Control

Products are automatically filtered based on user's membership tier using RLS:

```sql
CREATE POLICY "Products visible based on user tier"
  ON public.products FOR SELECT
  USING (
    archive = FALSE
    AND tier_required <= COALESCE(
      (SELECT membership_tier FROM public.profiles WHERE id = auth.uid()),
      0
    )
  );
```

### Automatic Membership Sync

Stripe webhooks update `profiles.membership_tier` when subscriptions change.

### Admin Role Checking

Admin routes check `admin_roles` table for access control.

---

## Next Steps

- [ ] Rental booking flow with date selection
- [ ] File uploads (Supabase Storage)
- [ ] Wishlists/favorites
- [ ] Email notifications
- [ ] Product search
- [ ] Analytics dashboard
