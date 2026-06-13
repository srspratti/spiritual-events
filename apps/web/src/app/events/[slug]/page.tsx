import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { compactLocation, formatDateTime } from '@/lib/format';

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { topics: { include: { topic: true } }, organizer: true }
  });
  if (!event || event.status !== 'published') notFound();

  return (
    <main className="container">
      <article className="panel">
        <div className="badges">
          <span className="badge">{event.sourceType.replace('_', ' ')}</span>
          {event.topics.map((et) => <span className="badge" key={et.topic.slug}>{et.topic.name}</span>)}
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-.05em' }}>{event.title}</h1>
        <p className="meta"><strong>When:</strong> {formatDateTime(event.startsAt, event.timezone)}{event.endsAt ? ` – ${formatDateTime(event.endsAt, event.timezone)}` : ''}</p>
        <p className="meta"><strong>Where:</strong> {compactLocation(event)}</p>
        {event.organizer && <p className="meta"><strong>Organizer:</strong> {event.organizer.name}</p>}
        {event.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.imageUrl} alt="" style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 20, margin: '24px 0' }} />
        )}
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{event.description}</div>
        <div className="actions">
          <a className="button" href={event.eventUrl} target="_blank" rel="noreferrer">View / RSVP on original source</a>
          <a className="button secondary" href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.startsAt.toISOString().replace(/[-:]/g, '').replace('.000', '')}/${(event.endsAt ?? event.startsAt).toISOString().replace(/[-:]/g, '').replace('.000', '')}&details=${encodeURIComponent(event.eventUrl)}`} target="_blank" rel="noreferrer">Add to Google Calendar</a>
        </div>
      </article>
    </main>
  );
}
