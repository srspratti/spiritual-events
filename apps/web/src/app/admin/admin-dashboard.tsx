'use client';

import { useEffect, useState } from 'react';

type EventRow = { id: string; title: string; sourceType: string; status: string; city?: string; startsAt: string; eventUrl: string };

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    setStatus('Loading...');
    const res = await fetch('/api/admin/events?status=pending', { headers: { 'x-admin-token': token } });
    const data = await res.json();
    if (!res.ok) setStatus(data.error || 'Unauthorized');
    else {
      setEvents(data.events);
      setStatus(`${data.events.length} pending event(s).`);
    }
  }

  async function action(id: string, action: 'approve' | 'reject') {
    const res = await fetch(`/api/admin/events/${id}/${action}`, { method: 'POST', headers: { 'x-admin-token': token } });
    const data = await res.json();
    setStatus(res.ok ? `${action}d: ${data.event.title}` : data.error || 'Failed');
    await load();
  }

  async function sync() {
    setStatus('Syncing sources...');
    const res = await fetch('/api/admin/sync', { method: 'POST', headers: { 'x-admin-token': token } });
    const data = await res.json();
    setStatus(res.ok ? `Sync complete: ${JSON.stringify(data.results)}` : data.error || 'Sync failed');
  }

  useEffect(() => { const saved = localStorage.getItem('admin_token'); if (saved) setToken(saved); }, []);
  useEffect(() => { if (token) localStorage.setItem('admin_token', token); }, [token]);

  return (
    <section className="panel grid">
      <label>Admin token<input value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_TOKEN" /></label>
      <div className="actions">
        <button className="button" onClick={load}>Load pending events</button>
        <button className="button secondary" onClick={sync}>Run source sync</button>
      </div>
      {status && <p className="meta">{status}</p>}
      <table className="table">
        <thead><tr><th>Title</th><th>Date</th><th>Source</th><th>City</th><th>Link</th><th>Actions</th></tr></thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{new Date(event.startsAt).toLocaleString()}</td>
              <td>{event.sourceType}</td>
              <td>{event.city || '-'}</td>
              <td><a href={event.eventUrl} target="_blank" rel="noreferrer">Open</a></td>
              <td>
                <button className="button secondary" onClick={() => action(event.id, 'approve')}>Approve</button>{' '}
                <button className="button ghost" onClick={() => action(event.id, 'reject')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
