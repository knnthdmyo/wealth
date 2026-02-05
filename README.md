# Wealth — Net Worth Tracker MVP

Mobile-first personal net worth tracker built with Next.js, Supabase, Tailwind CSS, TanStack Query, React Hook Form + Zod, Recharts, and Dayjs.

## Features
- Supabase Auth (login/register)
- Account CRUD with categories, liquidity, currencies, and liabilities
- Balance history tracking on every update
- FX conversion to PHP with 12h cache
- Net worth summary and history chart
- Dark mode with next-themes

## Supabase SQL Schema + RLS
Run the SQL in [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor.

## Environment Setup
Copy the example env file and fill in your Supabase values:

```bash
cp .env.example .env.local
```

Set these in .env.local:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Auth Config
In Supabase → Authentication → URL Configuration:
- Site URL: http://localhost:3000
- Redirect URLs: http://localhost:3000/**

Enable Email auth in Authentication → Providers.

## Local Development
```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Notes
- FX rates are fetched from exchangerate-api.com via /api/fx and cached for 12 hours.
- Account history records are inserted automatically on create and update.
