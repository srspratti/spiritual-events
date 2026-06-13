'use client';

import { useState } from 'react';

export default function SubmitEventForm({ topics }: { topics: { slug: string; name: string }[] }) {
  const [status, setStatus] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setStatus('Submitting...');
    const topics = formData.getAll('topics').map(String);
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
    const response = await fetch('/api/submit-event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...payload, topics })
    });
    const result = await response.json();
    setStatus(response.ok ? 'Submitted for admin review.' : result.error || 'Submission failed.');
  }

  return (
    <form className="panel form-grid" action={submit} style={{ marginTop: 24 }}>
      <label>Organizer name<input name="organizerName" required /></label>
      <label>Organizer email<input name="contactEmail" type="email" required /></label>
      <label className="full">Event title<input name="title" required /></label>
      <label className="full">Description<textarea name="description" rows={6} required /></label>
      <label>Start date/time<input name="startsAt" type="datetime-local" required /></label>
      <label>End date/time<input name="endsAt" type="datetime-local" /></label>
      <label>Timezone<input name="timezone" placeholder="America/Montreal" defaultValue="America/Montreal" /></label>
      <label>Source type
        <select name="sourceType" defaultValue="manual">
          <option value="manual">Manual / Organizer website</option>
          <option value="facebook">Facebook event link for review</option>
          <option value="meetup">Meetup</option>
          <option value="eventbrite">Eventbrite</option>
        </select>
      </label>
      <label className="full">Event / RSVP URL<input name="eventUrl" type="url" required /></label>
      <label className="full">Image URL<input name="imageUrl" type="url" /></label>
      <label>Venue name<input name="venueName" /></label>
      <label>Address<input name="address" /></label>
      <label>City<input name="city" placeholder="Montreal" /></label>
      <label>Region<input name="region" placeholder="QC" /></label>
      <label>Country<input name="country" placeholder="Canada" /></label>
      <label>Online?
        <select name="isOnline" defaultValue="false">
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </label>
      <fieldset className="full" style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 16 }}>
        <legend style={{ fontWeight: 900 }}>Topics</legend>
        <div className="badges">
          {topics.map((topic) => (
            <label key={topic.slug} style={{ display: 'inline-flex', flexDirection: 'row', gap: 8, alignItems: 'center', fontWeight: 700 }}>
              <input style={{ width: 'auto' }} type="checkbox" name="topics" value={topic.slug} /> {topic.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="full actions">
        <button className="button" type="submit">Submit for review</button>
        {status && <span className="meta">{status}</span>}
      </div>
    </form>
  );
}
