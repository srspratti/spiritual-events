export function formatDateTime(date: Date | string, timezone?: string | null) {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone || undefined
  }).format(value);
}

export function compactLocation(event: { isOnline: boolean; venueName?: string | null; city?: string | null; region?: string | null; country?: string | null }) {
  if (event.isOnline) return 'Online';
  return [event.venueName, event.city, event.region || event.country].filter(Boolean).join(' · ') || 'Location TBA';
}
