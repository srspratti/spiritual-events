export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'event';
}

export function eventSlug(title: string, city?: string | null, date?: Date) {
  const suffix = [city, date?.toISOString().slice(0, 10)].filter(Boolean).join(' ');
  return slugify(`${title} ${suffix}`);
}
