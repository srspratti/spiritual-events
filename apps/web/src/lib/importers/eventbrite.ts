import { Source, SourceType } from '@prisma/client';
import { env } from '../env';
import { NormalizedEvent } from '../events';

export async function fetchEventbriteEvents(source: Source): Promise<NormalizedEvent[]> {
  if (!env.EVENTBRITE_TOKEN) return [];
  if (!source.externalSourceId && !source.sourceUrl) {
    throw new Error('Eventbrite source needs external_source_id as organization ID or source_url as a full API URL.');
  }

  const apiUrl = source.sourceUrl?.includes('eventbriteapi.com')
    ? source.sourceUrl
    : `https://www.eventbriteapi.com/v3/organizations/${source.externalSourceId}/events/?status=live&order_by=start_asc`;

  const response = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${env.EVENTBRITE_TOKEN}` },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Eventbrite API failed: ${response.status} ${await response.text()}`);
  const json = await response.json();
  const rawEvents = json.events ?? [];

  return rawEvents
    .filter((event: any) => event.start?.utc && event.url)
    .map((event: any): NormalizedEvent => ({
      sourceType: SourceType.eventbrite,
      sourceId: source.id,
      organizerId: source.organizerId,
      externalEventId: event.id,
      title: event.name?.text || 'Untitled Eventbrite event',
      description: event.description?.text || event.summary || null,
      shortDescription: event.summary || null,
      eventUrl: event.url,
      imageUrl: event.logo?.url || null,
      startsAt: new Date(event.start.utc),
      endsAt: event.end?.utc ? new Date(event.end.utc) : null,
      timezone: event.start?.timezone || null,
      isOnline: Boolean(event.online_event),
      venueName: null,
      address: null,
      city: null,
      country: null,
      currency: event.currency || null,
      status: 'pending'
    }));
}
