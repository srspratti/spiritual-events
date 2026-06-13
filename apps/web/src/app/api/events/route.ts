import { NextRequest } from 'next/server';
import { getPublishedEvents } from '@/lib/events';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const events = await getPublishedEvents({
    city: sp.get('city') || undefined,
    topic: sp.get('topic') || undefined,
    q: sp.get('q') || undefined,
    online: sp.get('online') || undefined,
    limit: Number(sp.get('limit') || 50)
  });
  return Response.json({ events });
}
