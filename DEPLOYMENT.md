# Deployment Guide

This guide uses a simple production path:

- Web/API: Vercel
- Database: Supabase Postgres, Neon, Railway Postgres, or any managed PostgreSQL provider
- Mobile: Expo EAS Build and EAS Submit

## 1. Create production database

Create a managed PostgreSQL database. Copy its connection string into:

```txt
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
```

If using serverless hosting, use the provider's pooled connection URL when recommended. For Supabase, check the dashboard's connection pooling/Supavisor settings.

## 2. Push repo to GitHub

```bash
git init
git add .
git commit -m "Initial spiritual events MVP"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/spiritual-events-mvp.git
git push -u origin main
```

## 3. Create Vercel project

1. Import the GitHub repo in Vercel.
2. Set the project root to:

```txt
apps/web
```

3. Use these commands:

```txt
Install command: npm install
Build command: npm run build
Output directory: .next
```

If Vercel detects the monorepo differently, use root-level install and this build command:

```txt
npm --workspace apps/web run build
```

## 4. Add environment variables in Vercel

Add these variables to Production, Preview, and Development as needed:

```txt
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
ADMIN_TOKEN=use-a-long-random-secret
CRON_SECRET=use-a-second-long-random-secret
EVENTBRITE_TOKEN=
MEETUP_ACCESS_TOKEN=
GOOGLE_MAPS_API_KEY=
```

Generate secrets:

```bash
openssl rand -base64 32
```

## 5. Run database migration in production

Option A: From your laptop after setting production `DATABASE_URL` locally:

```bash
cd apps/web
DATABASE_URL="postgresql://..." npm run db:deploy
DATABASE_URL="postgresql://..." npm run db:seed
```

Option B: Add a one-time migration job in your hosting/provider dashboard.

Do not use `prisma migrate dev` in production. Use `prisma migrate deploy`.

## 6. Deploy web app

Push to GitHub. Vercel deploys automatically.

Check:

```txt
https://your-domain.com
https://your-domain.com/events
https://your-domain.com/admin
```

## 7. Configure source sync

The repo includes `vercel.json` with a daily cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 6 * * *"
    }
  ]
}
```

The cron endpoint requires:

```txt
Authorization: Bearer CRON_SECRET
```

For manual test:

```bash
curl "https://your-domain.com/api/cron/sync?secret=YOUR_CRON_SECRET"
```

## 8. Connect custom domain

In Vercel:

1. Go to Project Settings → Domains.
2. Add your domain.
3. Update DNS records as shown by Vercel.
4. Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_BASE_URL` to the final domain.

## 9. Mobile deployment

Install EAS CLI:

```bash
npm install -g eas-cli
```

Login and configure:

```bash
cd apps/mobile
eas login
eas build:configure
```

Set production API URL:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-domain.com
```

Build Android:

```bash
eas build --platform android --profile production
```

Build iOS:

```bash
eas build --platform ios --profile production
```

Submit to stores:

```bash
eas submit --platform android
eas submit --platform ios
```

## 10. Production hardening checklist

Before public launch:

- Replace token-only admin with Clerk/Auth0/Supabase Auth and admin roles.
- Add rate limiting to `/api/submit-event`.
- Add CAPTCHA to public event submission.
- Add moderation notes and duplicate merge UI.
- Add organizer verification.
- Add source removal/takedown page.
- Add privacy policy and terms.
- Add Sentry error tracking.
- Add PostHog/Plausible analytics.
- Add database backups.
- Monitor API import logs.

## 11. First launch operations

1. Seed 20–50 real events manually.
2. Add 5–10 trusted organizers.
3. Add public calendar feeds from temples/yoga studios where permitted.
4. Approve only high-quality events.
5. Start with one city, e.g. Montreal.
6. Expand to Toronto/Ottawa after the workflow is stable.
