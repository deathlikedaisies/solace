# Solace

Solace is a production-ready MVP for private benzodiazepine taper tracking built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

## What is included

- Supabase email/password authentication with protected app routes
- Onboarding for benzo name, current dose, taper start date, and notes
- Daily check-ins for dose, anxiety, mood, sleep, symptoms, and notes
- Dashboard with lightweight SVG charts for dose, anxiety, sleep, and mood
- Timeline that combines daily logs, dose events, and inferred hold markers
- Journal/history view with client-side date filtering
- CSV export route for user log data
- Persistent medical disclaimer and a gentle safety prompt for severe entries

## Project structure

```text
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
  (app)/
    onboarding/page.tsx
    (onboarded)/
      dashboard/page.tsx
      timeline/page.tsx
      journal/page.tsx
  api/export/logs/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  auth/auth-form.tsx
  charts/metric-chart.tsx
  forms/daily-checkin-form.tsx
  forms/onboarding-form.tsx
  journal/history-list.tsx
  layout/app-shell.tsx
  layout/disclaimer-banner.tsx
  layout/nav-links.tsx
  ui/button.tsx
  ui/card.tsx
lib/
  actions/
    auth.ts
    logs.ts
    profile.ts
  auth.ts
  constants.ts
  data.ts
  database.types.ts
  supabase/
    client.ts
    server.ts
    shared.ts
  utils.ts
supabase/
  schema.sql
proxy.ts
.env.example
```

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Create a Supabase project.

3. Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. In the Supabase SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql).

5. Make sure Email auth is enabled in Supabase Authentication.

6. Start the app.

```bash
npm run dev
```

## Supabase notes

- `profiles` stores onboarding data.
- `daily_logs` stores one log per user per day.
- `dose_events` stores onboarding and inferred dose change markers.
- RLS is enabled on every table and scoped to `auth.uid()`.

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as project environment variables.
4. Deploy.
5. In Supabase Auth, add your Vercel production URL to the allowed site URLs if needed.

## MVP boundaries

- Private by default
- No community features
- No AI recommendations
- No taper advice generation
- No medical advice
