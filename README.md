# Cartly

A multi-seller marketplace built with Next.js 15 (App Router), Prisma, PostgreSQL and NextAuth.

- **Storefront**: home, searchable catalog, product pages, cart, checkout (pay on delivery), order tracking
- **Buyers**: account overview and order history with a tracking timeline
- **Sellers**: open a store, manage products and stock, fulfil orders, revenue dashboard
- **Admins**: platform analytics, user roles, product moderation, all orders
- **Auth**: email + password and Google OAuth (GitHub optional)
- **UI**: Satoshi typeface, light and dark themes

## Run locally

```bash
bun install
cp .env.example .env        # then fill in the values
bun run db:migrate          # create the tables
bun run db:seed             # optional: demo store with 18 products
bun run dev
```

To make yourself an admin, sign up in the app first, then run
`ADMIN_EMAIL=you@example.com bun run db:seed`.

## Deploy to Vercel

1. Create a hosted PostgreSQL database (Neon, Supabase, Vercel Postgres…).
   A `localhost` database cannot be reached from Vercel.
2. In the Vercel project, set these environment variables:
   `DATABASE_URL`, `NEXTAUTH_URL` (your production URL), `NEXTAUTH_SECRET`,
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
3. Run the migrations against that database once:
   `DATABASE_URL="<hosted url>" bun run db:migrate` (and `db:seed` if you want demo data).
4. In Google Cloud Console → Credentials → your OAuth client, add the redirect URI
   `https://<your-domain>/api/auth/callback/google`.
5. Deploy. The build runs `prisma generate` automatically.

## Project layout

| Path | What lives there |
| --- | --- |
| `app/(store)` | Public storefront, cart, checkout, order pages |
| `app/buyer`, `app/seller`, `app/admin` | Role dashboards |
| `app/api` | JSON API (auth, catalog, cart, orders, seller, admin) |
| `components` | Shared UI |
| `lib` | Auth config, catalog queries, helpers |
| `prisma` | Schema, migrations, seed script |
| `middleware.ts` | Route protection by role |
