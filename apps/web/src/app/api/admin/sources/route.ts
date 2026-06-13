import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth';

const schema = z.object({
  organizerName: z.string().min(2),
  sourceType: z.enum(['ics', 'google_calendar', 'meetup', 'eventbrite', 'facebook']),
  sourceName: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  externalSourceId: z.string().optional().or(z.literal('')),
  authStatus: z.enum(['not_required', 'pending', 'authorized', 'expired', 'rejected']).default('not_required')
});

export async function GET(request: NextRequest) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;
  const sources = await prisma.source.findMany({ include: { organizer: true }, orderBy: { createdAt: 'desc' } });
  return Response.json({ sources });
}

export async function POST(request: NextRequest) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const organizer = await prisma.organizer.create({ data: { name: data.organizerName, trustLevel: 'trusted' } });
  const source = await prisma.source.create({
    data: {
      organizerId: organizer.id,
      sourceType: data.sourceType,
      sourceName: data.sourceName || data.organizerName,
      sourceUrl: data.sourceUrl || null,
      externalSourceId: data.externalSourceId || null,
      authStatus: data.authStatus,
      isActive: true
    }
  });
  return Response.json({ source }, { status: 201 });
}
