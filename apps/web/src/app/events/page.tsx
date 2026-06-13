import { EventCard } from '@/components/EventCard';
import { prisma } from '@/lib/prisma';
import { getPublishedEvents } from '@/lib/events';

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const events = await getPublishedEvents({
    city: params.city,
    topic: params.topic,
    q: params.q,
    online: params.online,
    limit: 80
  });
  const topics = await prisma.topic.findMany({ orderBy: { name: 'asc' } });

  return (
    <main className="container">
      <h1>Explore events</h1>
      <form className="filters">
        <label>Keyword
          <input name="q" placeholder="kirtan, gita, meditation..." defaultValue={params.q || ''} />
        </label>
        <label>City
          <input name="city" placeholder="Montreal" defaultValue={params.city || ''} />
        </label>
        <label>Topic
          <select name="topic" defaultValue={params.topic || ''}>
            <option value="">All topics</option>
            {topics.map((topic) => <option key={topic.slug} value={topic.slug}>{topic.name}</option>)}
          </select>
        </label>
        <button className="button" type="submit">Search</button>
      </form>
      <div className="event-grid">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
      {!events.length && <p className="notice">No events found. Try a broader topic or submit a community event.</p>}
    </main>
  );
}
