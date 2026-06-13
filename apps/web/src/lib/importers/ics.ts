import * as ical from 'node-ical';
import { Source, SourceType } from '@prisma/client';
import { NormalizedEvent } from '../events';

function getText(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'val' in (value as any)) return String((value as any).val);
  return String(value);
}

export async function fetchIcsEvents(source: Source): Promise<NormalizedEvent[]> {
  if (!source.sourceUrl) throw new Error('ICS source_url is required.');
  const data = await ical.async.fromURL(source.sourceUrl);
  const events: NormalizedEvent[] = [];

  for (const item of Object.values(data)) {
    if (!item || item.type !== 'VEVENT') continue;
    if (!item.start || !item.summary) continue;
    const startsAt = new Date(item.start as Date);
    if (startsAt.getTime() < Date.now() - 1000 * 60 * 60 * 24) continue;
    const url = getText((item as any).url) || source.sourceUrl;
    const location = getText((item as any).location);

    events.push({
      sourceType: source.sourceType as SourceType,
      sourceId: source.id,
      organizerId: source.organizerId,
      externalEventId: item.uid || `${source.id}-${startsAt.toISOString()}-${item.summary}`,
      title: String(item.summary),
      description: getText((item as any).description),
      eventUrl: url,
      startsAt,
      endsAt: item.end ? new Date(item.end as Date) : null,
      timezone: null,
      isOnline: /zoom|meet|online|virtual/i.test(`${location} ${url}`),
      venueName: location,
      address: location,
      city: null,
      country: null,
      status: 'pending'
    });
  }

  return events;
}
