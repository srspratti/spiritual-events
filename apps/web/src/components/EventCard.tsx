import Link from 'next/link';
import { compactLocation, formatDateTime } from '@/lib/format';

export function EventCard({ event }: { event: any }) {
  const topics = event.topics?.map((et: any) => et.topic) ?? [];
  return (
    <article className="card">
      {event.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.imageUrl} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
      ) : (
        <div style={{ height: 180, display: 'grid', placeItems: 'center', background: '#ffedd5', color: '#9a3412', fontWeight: 900 }}>Spiritual Event</div>
      )}
      <div className="card-body">
        <div className="badges">
          <span className="badge">{event.sourceType.replace('_', ' ')}</span>
          {topics.slice(0, 3).map((topic: any) => <span className="badge" key={topic.slug}>{topic.name}</span>)}
        </div>
        <h3><Link href={`/events/${event.slug}`}>{event.title}</Link></h3>
        <p className="meta">{formatDateTime(event.startsAt, event.timezone)}</p>
        <p className="meta">{compactLocation(event)}</p>
        {event.shortDescription && <p className="meta">{event.shortDescription}</p>}
        <div className="actions">
          <Link className="button secondary" href={`/events/${event.slug}`}>Details</Link>
          <a className="button" href={event.eventUrl} target="_blank" rel="noreferrer">View source</a>
        </div>
      </div>
    </article>
  );
}
