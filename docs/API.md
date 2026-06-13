# API Reference

## Public

### GET /api/events

Query params:

- `city`
- `topic`
- `q`
- `online=true|false`
- `limit`

### GET /api/events/:id

`:id` can be event ID or slug.

### GET /api/topics

Returns topic list.

### POST /api/submit-event

Creates a pending event and organizer submission.

## Admin

All admin routes require header:

```txt
x-admin-token: ADMIN_TOKEN
```

### GET /api/admin/events?status=pending

Lists events by moderation status.

### POST /api/admin/events/:id/approve

Approves event.

### POST /api/admin/events/:id/reject

Rejects event.

### POST /api/admin/sources

Creates external source.

Body example:

```json
{
  "organizerName": "Local Temple",
  "sourceType": "ics",
  "sourceName": "Temple Calendar",
  "sourceUrl": "https://example.com/calendar.ics",
  "authStatus": "not_required"
}
```

### POST /api/admin/sync

Runs all importers manually.

## Cron

### GET /api/cron/sync

Requires one of:

```txt
Authorization: Bearer CRON_SECRET
```

or:

```txt
/api/cron/sync?secret=CRON_SECRET
```
