# TradeVault Journal

A modern Next.js trading journal MVP for accounts, trades, prop firm rule tracking, payouts, psychology notes, calendars, and analytics.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- Recharts
- Prisma ORM
- SQLite
- NextAuth email/password authentication

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set `NEXTAUTH_SECRET`.

3. Create and seed the database:

```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

4. Run the app:

```bash
npm run dev
```

Demo account after seeding:

- Email: `demo@tradevault.app`
- Password: `password123`

## Vercel Deployment Notes

Required environment variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

This MVP currently uses SQLite for local development. SQLite is fine for demos and local builds, but Vercel serverless functions do not provide durable writable filesystem storage. For a real production launch, move `DATABASE_URL` to a managed database provider such as Supabase Postgres or another hosted Postgres database, then update `prisma/schema.prisma` datasource provider from `sqlite` to `postgresql` and run a production migration.

Uploaded trade screenshots are currently stored under `public/uploads` for local development. On Vercel, use persistent object storage such as Vercel Blob, Supabase Storage, or S3-compatible storage before relying on uploads in production.

## Project Structure

- `app/` - routes, pages, server actions, API handlers
- `components/` - reusable UI, charts, navigation
- `lib/` - auth, Prisma client, analytics helpers, utilities
- `prisma/` - schema and seed data
- `types/` - NextAuth type augmentation
- `hooks/` - reserved for future client hooks
