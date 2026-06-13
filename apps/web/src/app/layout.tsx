import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Spiritual Events MVP',
  description: 'Discover kirtan, Gita, meditation, yoga, and bhakti events near you.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link className="brand" href="/">
            <span className="logo">ॐ</span>
            <span>Spiritual Events</span>
          </Link>
          <div className="nav-links" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/events">Events</Link>
            <Link href="/submit-event">Submit event</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </nav>
        {children}
        <footer className="footer">
          Events are sourced from organizers and permitted public integrations. RSVP happens on the original source.
        </footer>
      </body>
    </html>
  );
}
