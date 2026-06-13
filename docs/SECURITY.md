# Security Checklist

Before public launch:

- Replace token-based admin access with real authentication.
- Add CAPTCHA to event submission.
- Add rate limiting to public API routes.
- Validate and proxy uploaded images instead of hotlinking arbitrary URLs.
- Add CSP headers.
- Add audit logs for admin actions.
- Add organizer verification before auto-publishing.
- Use separate production/preview databases.
- Rotate ADMIN_TOKEN and CRON_SECRET regularly.
- Never commit .env files.
