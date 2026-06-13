import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;
  const status = request.nextUrl.searchParams.get('status') as any || 'pending';
  const events = await prisma.event.findMany({
    where: { status },
    orderBy: { startsAt: 'asc' },
    take: 100,
    select: { id: true, title: true, sourceType: true, status: true, city: true, startsAt: true, eventUrl: true }
  });
  return Response.json({ events });
}
