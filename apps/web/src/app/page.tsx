import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/EventCard';

export default async function HomePage() {
  const events = await prisma.event.findMany({
    where: { status: 'published', startsAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 6) } },
    include: { topics: { include: { topic: true } } },
    orderBy: { startsAt: 'asc' },
    take: 6
  });

  return (
    <main className="container">
      <section className="hero">
        <div>
          <h1>Find kirtan, Gita, meditation, and bhakti events near you.</h1>
          <p>Aggregate permitted events from organizers, calendars, Meetup, Eventbrite, and authorized Facebook sources — with admin review and source attribution.</p>
          <div className="actions">
            <Link className="button" href="/events">Explore events</Link>
            <Link className="button secondary" href="/submit-event">Submit an event</Link>
          </div>
        </div>
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>MVP source policy</h2>
          <p className="meta">Facebook events are only shown when the organizer/admin grants permitted access or submits the event for review. This app does not scrape private groups, private events, member lists, or personal Facebook data.</p>
          <div className="badges" style={{ marginTop: 16 }}>
            <span className="badge">Manual submissions</span>
            <span className="badge">ICS feeds</span>
            <span className="badge">Meetup</span>
            <span className="badge">Eventbrite</span>
            <span className="badge">Authorized Facebook only</span>
          </div>
        </div>
      </section>

      <h2>Upcoming events</h2>
      <div className="event-grid">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </main>
  );
}
