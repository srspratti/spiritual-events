export const TOPIC_KEYWORDS: Record<string, string[]> = {
  kirtan: ['kirtan', 'bhajan', 'mantra music', 'chanting', 'hare krishna', 'maha mantra'],
  gita: ['bhagavad gita', 'gita class', 'gita study', 'gita discussion', 'krishna speaks'],
  iskcon: ['iskcon', 'hare krishna', 'krishna consciousness', 'gaudiya', 'vaishnava', 'bhakti centre', 'bhakti center'],
  meditation: ['meditation', 'mindfulness', 'japa', 'mantra meditation', 'sound meditation'],
  yoga: ['yoga', 'bhakti yoga', 'hatha yoga', 'karma yoga', 'jnana yoga'],
  retreat: ['retreat', 'ashram', 'weekend retreat', 'pilgrimage'],
  festival: ['janmashtami', 'ratha yatra', 'gita jayanti', 'ekadashi', 'gaura purnima', 'diwali', 'holi'],
  satsang: ['satsang', 'sanga', 'spiritual discussion', 'wisdom circle'],
  youth: ['youth', 'young professionals', 'students', 'campus', 'university']
};

export function classifyTopicSlugs(title: string, description = ''): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const matches = Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([slug]) => slug);
  return [...new Set(matches)];
}
