# Christdale

Calisthenics equipment + coaching platform. Built off the SRS v1.0
(FR-001–FR-015).

**Current status:**
- ✅ **Phase 1** — Home, About, Coaches, Contact
- ✅ **Phase 2** — Product catalog with search/filter (FR-003–FR-005)
- ✅ **Phase 3a** — Real database (Supabase Postgres + Prisma), seeded data
- ✅ **Phase 3b (auth)** — Real accounts via Supabase Auth (FR-001, FR-002)
- 🔧 **Next up** — Cart persisted per user in the DB, checkout + payment
  gateway integration (FR-007, FR-008)

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — custom token set in `tailwind.config.ts`
- **Prisma** + **PostgreSQL** (via Supabase, free tier)
- **Supabase Auth** — real sign-up/login (email + password)
- Fonts: Anton (display), Work Sans (body), IBM Plex Mono (labels/prices)

## Getting started

```bash
npm install
```

You need Supabase set up before `npm run dev` will work fully — Home,
Products, and Coaches query the database directly, and the login
modal needs real Supabase Auth credentials.

## Database + Auth setup (Supabase, free)

1. Go to [supabase.com](https://supabase.com) and sign up (free, no
   card required). Create a project — region **Southeast Asia
   (Singapore)** for the Philippines — and save the database password
   you set.
2. Click **Connect** (top of the project dashboard) → **ORMs** tab →
   select **Prisma**. Copy the two connection strings shown (pooled
   and direct).
3. Go to **Project Settings → API Keys**. Copy the **Project URL** and
   the **anon / public key**.
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Fill in all four values in `.env`:
   - `DATABASE_URL` (pooled, port 6543)
   - `DIRECT_URL` (direct, port 5432)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   For the two connection strings, replace `[YOUR-PASSWORD]` with your
   database password. If it contains special characters (`@`, `#`,
   `%`, etc.), URL-encode them — e.g. `@` becomes `%40`.
6. Push the schema and seed sample data:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```
7. Run the app:
   ```bash
   npm run dev
   ```

### About email confirmation

By default, Supabase requires new users to click a confirmation link
before they can log in. While you're still building/testing, this
adds friction — to turn it off: **Authentication → Providers → Email
→ toggle off "Confirm email"**. Turn it back on before you launch
publicly, or use a transactional email setup so the confirmation
email actually reaches people (Supabase's default email sender is
rate-limited and not meant for production).

Free tier limits (plenty for development and early launch): 500MB
database, 5GB bandwidth/month, 50,000 monthly active auth users. A
free project pauses after 7 days of inactivity — just open the
Supabase dashboard to un-pause it.

## Project structure

```
src/
  app/
    layout.tsx          Root layout — Auth/Cart providers, Nav, Footer, modal
    page.tsx             Home (server component, queries DB)
    products/page.tsx    Catalog (server component, queries DB)
    coaches/page.tsx      Coaches (server component, queries DB)
    cart/page.tsx          Local cart view (checkout not wired up yet)
    contact/page.tsx        Contact form stub
    about/page.tsx
  components/
    Nav.tsx / Footer.tsx
    ProductCard.tsx        Gated "Buy Now" — opens AuthModal if logged out
    ProductsFilter.tsx      Client-side search/filter over server-fetched products
    CoachCard.tsx / CoachesList.tsx  Gated "Request Coaching"
    AuthModal.tsx            Centered login/signup modal (real Supabase Auth)
  context/
    AuthContext.tsx           Real session via Supabase Auth + requireAuth() gate
    CartContext.tsx            Local (browser) cart state — not yet tied to account
  lib/
    products.ts / coaches.ts    Prisma queries (server-only)
    prisma.ts                    Prisma client singleton
    supabase/client.ts             Supabase browser client (used by AuthContext)
prisma/
  schema.prisma                  Full data model for all phases
  seed.ts                         Populates sample products/categories/coaches
```

## Roadmap

- [x] **Phase 1** — Home, About, Coaches, Contact
- [x] **Phase 2** — Product catalog, search/filter
- [x] **Phase 3a** — Database (Supabase + Prisma), seeded data
- [x] **Phase 3b** — Real auth (Supabase Auth)
- [ ] **Phase 3c** — Cart persisted to DB per user (`Cart`/`CartItem`
      models already exist in the schema), checkout + payment gateway
      (FR-007, FR-008). Recommended: PayMongo or Xendit for GCash/Maya
      support, or Stripe for international customers.
- [ ] **Phase 4** — Order tracking (FR-009), coaching requests wired to
      the `CoachingRequest` table (FR-011), customer profile page
- [ ] **Phase 5** — Admin dashboard: product/inventory/order/coach
      management (FR-012–FR-015)

**Deferred (per SRS Section 7 — out of scope for v1.0):** wishlist,
reviews/ratings, loyalty program, AI recommendations, booking calendar,
live chat, mobile app, community forum, personalized workout plans.

## Deploying

Vercel is the path of least resistance — connect the repo, add the
same environment variables from `.env` in the Vercel dashboard, and it
deploys on push. Supabase's connection strings and API keys work as-is
from Vercel; no extra config needed.
