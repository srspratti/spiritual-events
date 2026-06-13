import { z } from 'zod';
import { SourceType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { upsertNormalizedEvent } from '@/lib/events';

const schema = z.object({
  organizerName: z.string().min(2),
  contactEmail: z.string().email(),
  sourceType: z.enum(['manual', 'facebook', 'meetup', 'eventbrite']).default('manual'),
  title: z.string().min(4),
  description: z.string().min(20),
  eventUrl: z.string().url(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  startsAt: z.string().min(1),
  endsAt: z.string().optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
  isOnline: z.enum(['true', 'false']).default('false'),
  venueName: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  region: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  topics: z.array(z.string()).optional().default([])
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const organizer = await prisma.organizer.create({
    data: {
      name: data.organizerName,
      contactEmail: data.contactEmail,
      trustLevel: 'pending'
    }
  });

  const source = await prisma.source.create({
    data: {
      organizerId: organizer.id,
      sourceType: data.sourceType as SourceType,
      sourceName: `${data.organizerName} submission`,
      sourceUrl: data.eventUrl,
      authStatus: data.sourceType === 'facebook' ? 'pending' : 'not_required'
    }
  });

  const event = await upsertNormalizedEvent({
    sourceType: data.sourceType as SourceType,
    sourceId: source.id,
    organizerId: organizer.id,
    externalEventId: `${data.sourceType}-${data.eventUrl}`,
    title: data.title,
    description: data.description,
    eventUrl: data.eventUrl,
    imageUrl: data.imageUrl || null,
    startsAt: new Date(data.startsAt),
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
    timezone: data.timezone || null,
    isOnline: data.isOnline === 'true',
    venueName: data.venueName || null,
    address: data.address || null,
    city: data.city || null,
    region: data.region || null,
    country: data.country || null,
    status: 'pending'
  });

  for (const slug of data.topics) {
    const topic = await prisma.topic.findUnique({ where: { slug } });
    if (!topic) continue;
    await prisma.eventTopic.upsert({
      where: { eventId_topicId: { eventId: event.id, topicId: topic.id } },
      update: {},
      create: { eventId: event.id, topicId: topic.id }
    });
  }

  return Response.json({ event, message: 'Event submitted for admin review.' }, { status: 201 });
}
