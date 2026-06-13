# Web App

Next.js full-stack app with Prisma/PostgreSQL.

## Commands

```bash
npm run dev
npm run build
npm run db:generate
npm run db:deploy
npm run db:seed
npm run db:studio
```

## API summary

```txt
GET  /api/events
GET  /api/events/:id
GET  /api/topics
POST /api/submit-event
GET  /api/admin/events
POST /api/admin/events/:id/approve
POST /api/admin/events/:id/reject
GET  /api/cron/sync
POST /api/admin/sync
POST /api/admin/sources
```
