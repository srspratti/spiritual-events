import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const event = await prisma.event.update({ where: { id }, data: { status: 'published' } });
  return Response.json({ event });
}
