import { Prisma, SourceType } from '@prisma/client';
import { prisma } from './prisma';
import { eventSlug } from './slug';
import { classifyTopicSlugs } from './topics';

export type NormalizedEvent = {
  sourceType: SourceType;
  externalEventId?: string | null;
  sourceId?: string | null;
  organizerId?: string | null;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  eventUrl: string;
  imageUrl?: string | null;
  startsAt: Date;
  endsAt?: Date | null;
  timezone?: string | null;
  isOnline?: boolean;
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string | null;
  status?: 'pending' | 'published';
};

function shortDescription(description?: string | null) {
  if (!description) return null;
  return description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 180);
}

async function uniqueSlug(title: string, city: string | null | undefined, startsAt: Date, currentId?: string) {
  const base = eventSlug(title, city, startsAt);
  let slug = base;
  let i = 2;
  while (true) {
    const found = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === currentId) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function attachTopics(eventId: string, title: string, description?: string | null) {
  const slugs = classifyTopicSlugs(title, description ?? '');
  for (const slug of slugs) {
    const topic = await prisma.topic.findUnique({ where: { slug } });
    if (!topic) continue;
    await prisma.eventTopic.upsert({
      where: { eventId_topicId: { eventId, topicId: topic.id } },
      update: {},
      create: { eventId, topicId: topic.id }
    });
  }
}

export async function upsertNormalizedEvent(input: NormalizedEvent) {
  const existing = input.externalEventId
    ? await prisma.event.findUnique({
        where: { sourceType_externalEventId: { sourceType: input.sourceType, externalEventId: input.externalEventId } }
      })
    : null;

  const data: Prisma.EventUncheckedCreateInput = {
    sourceId: input.sourceId ?? undefined,
    organizerId: input.organizerId ?? undefined,
    sourceType: input.sourceType,
    externalEventId: input.externalEventId ?? `${input.sourceType}-${input.eventUrl}`,
    slug: existing?.slug ?? await uniqueSlug(input.title, input.city, input.startsAt, existing?.id),
    title: input.title,
    description: input.description ?? null,
    shortDescription: input.shortDescription ?? shortDescription(input.description),
    eventUrl: input.eventUrl,
    imageUrl: input.imageUrl ?? null,
    startsAt: input.startsAt,
    endsAt: input.endsAt ?? null,
    timezone: input.timezone ?? null,
    isOnline: input.isOnline ?? false,
    venueName: input.venueName ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    region: input.region ?? null,
    country: input.country ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    priceMin: input.priceMin as any,
    priceMax: input.priceMax as any,
    currency: input.currency ?? null,
    status: input.status ?? 'pending',
    qualityScore: new Prisma.Decimal(qualityScore(input))
  };

  const event = existing
    ? await prisma.event.update({ where: { id: existing.id }, data })
    : await prisma.event.create({ data });

  await attachTopics(event.id, input.title, input.description);
  return event;
}

export function qualityScore(input: NormalizedEvent) {
  let score = 0;
  if (input.title) score += 0.2;
  if (input.description && input.description.length > 50) score += 0.15;
  if (input.eventUrl) score += 0.15;
  if (input.startsAt) score += 0.15;
  if (input.city || input.isOnline) score += 0.1;
  if (input.imageUrl) score += 0.1;
  if (input.venueName || input.address || input.isOnline) score += 0.1;
  if (input.organizerId) score += 0.05;
  return Math.min(1, score);
}

export async function getPublishedEvents(search: {
  city?: string;
  topic?: string;
  q?: string;
  online?: string;
  limit?: number;
}) {
  const where: Prisma.EventWhereInput = {
    status: 'published',
    startsAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 6) }
  };
  if (search.city) where.city = { contains: search.city, mode: 'insensitive' };
  if (search.q) where.OR = [
    { title: { contains: search.q, mode: 'insensitive' } },
    { description: { contains: search.q, mode: 'insensitive' } }
  ];
  if (search.online === 'true') where.isOnline = true;
  if (search.online === 'false') where.isOnline = false;
  if (search.topic) {
    where.topics = { some: { topic: { slug: search.topic } } };
  }

  return prisma.event.findMany({
    where,
    include: { topics: { include: { topic: true } }, organizer: true },
    orderBy: { startsAt: 'asc' },
    take: search.limit ?? 50
  });
}
