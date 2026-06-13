import { SourceType } from '@prisma/client';
import { prisma } from '../prisma';
import { upsertNormalizedEvent, NormalizedEvent } from '../events';
import { fetchIcsEvents } from './ics';
import { fetchEventbriteEvents } from './eventbrite';
import { fetchMeetupEvents } from './meetup';
import { fetchFacebookEvents } from './facebook';

async function fetchForSource(source: any): Promise<NormalizedEvent[]> {
  switch (source.sourceType) {
    case SourceType.ics:
    case SourceType.google_calendar:
      return fetchIcsEvents(source);
    case SourceType.eventbrite:
      return fetchEventbriteEvents(source);
    case SourceType.meetup:
      return fetchMeetupEvents(source);
    case SourceType.facebook:
      return fetchFacebookEvents(source);
    case SourceType.manual:
    default:
      return [];
  }
}

export async function syncSource(sourceId: string) {
  const source = await prisma.source.findUnique({ where: { id: sourceId } });
  if (!source || !source.isActive) throw new Error('Source not found or inactive.');

  try {
    const events = await fetchForSource(source);
    let createdCount = 0;
    let updatedCount = 0;
    for (const event of events) {
      const existed = event.externalEventId
        ? await prisma.event.findUnique({ where: { sourceType_externalEventId: { sourceType: event.sourceType, externalEventId: event.externalEventId } }, select: { id: true } })
        : null;
      await upsertNormalizedEvent(event);
      if (existed) updatedCount += 1;
      else createdCount += 1;
    }

    await prisma.source.update({ where: { id: source.id }, data: { lastSyncedAt: new Date() } });
    await prisma.importLog.create({
      data: { sourceId: source.id, status: 'success', fetchedCount: events.length, createdCount, updatedCount }
    });
    return { sourceId: source.id, status: 'success', fetchedCount: events.length, createdCount, updatedCount };
  } catch (error: any) {
    await prisma.importLog.create({
      data: { sourceId: source.id, status: 'failed', errorMessage: error?.message ?? String(error) }
    });
    throw error;
  }
}

export async function syncAllSources() {
  const sources = await prisma.source.findMany({
    where: { isActive: true, sourceType: { not: SourceType.manual } },
    orderBy: { createdAt: 'asc' }
  });
  const results = [];
  for (const source of sources) {
    try {
      results.push(await syncSource(source.id));
    } catch (error: any) {
      results.push({ sourceId: source.id, status: 'failed', error: error?.message ?? String(error) });
    }
  }
  return results;
}
