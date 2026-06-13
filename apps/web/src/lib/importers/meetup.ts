import { Source, SourceType } from '@prisma/client';
import { env } from '../env';
import { NormalizedEvent } from '../events';

const query = `
query GroupEvents($urlname: String!) {
  groupByUrlname(urlname: $urlname) {
    id
    name
    upcomingEvents(input: {first: 25}) {
      edges {
        node {
          id
          title
          description
          eventUrl
          dateTime
          endTime
          timezone
          imageUrl
          isOnline
          venue { name address city state country lat lng }
        }
      }
    }
  }
}`;

export async function fetchMeetupEvents(source: Source): Promise<NormalizedEvent[]> {
  if (!env.MEETUP_ACCESS_TOKEN) return [];
  const urlname = source.externalSourceId;
  if (!urlname) throw new Error('Meetup source external_source_id must be the Meetup group URL name.');

  const response = await fetch('https://api.meetup.com/gql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.MEETUP_ACCESS_TOKEN}`
    },
    body: JSON.stringify({ query, variables: { urlname } }),
    cache: 'no-store'
  });

  if (!response.ok) throw new Error(`Meetup API failed: ${response.status} ${await response.text()}`);
  const json = await response.json();
  if (json.errors?.length) throw new Error(`Meetup GraphQL error: ${JSON.stringify(json.errors)}`);

  const edges = json.data?.groupByUrlname?.upcomingEvents?.edges ?? [];
  return edges.map((edge: any): NormalizedEvent => {
    const event = edge.node;
    const venue = event.venue;
    return {
      sourceType: SourceType.meetup,
      sourceId: source.id,
      organizerId: source.organizerId,
      externalEventId: event.id,
      title: event.title,
      description: event.description || null,
      eventUrl: event.eventUrl,
      imageUrl: event.imageUrl || null,
      startsAt: new Date(event.dateTime),
      endsAt: event.endTime ? new Date(event.endTime) : null,
      timezone: event.timezone || null,
      isOnline: Boolean(event.isOnline),
      venueName: venue?.name || null,
      address: venue?.address || null,
      city: venue?.city || null,
      region: venue?.state || null,
      country: venue?.country || null,
      lat: venue?.lat || null,
      lng: venue?.lng || null,
      status: 'pending'
    };
  });
}
