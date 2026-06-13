import { NextRequest } from 'next/server';
import { env } from './env';

export function assertAdmin(request: NextRequest) {
  const token = request.headers.get('x-admin-token') || request.nextUrl.searchParams.get('admin_token');
  if (!token || token !== env.ADMIN_TOKEN) {
    return Response.json({ error: 'Unauthorized. Add x-admin-token header.' }, { status: 401 });
  }
  return null;
}

export function assertCron(request: NextRequest) {
  const header = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');
  if (header === `Bearer ${env.CRON_SECRET}` || querySecret === env.CRON_SECRET) {
    return null;
  }
  return Response.json({ error: 'Unauthorized cron request.' }, { status: 401 });
}
