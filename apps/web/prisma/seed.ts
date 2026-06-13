import { PrismaClient, SourceType } from '@prisma/client';

const prisma = new PrismaClient();

const topics = [
  ['kirtan', 'Kirtan'],
  ['gita', 'Bhagavad Gita'],
  ['iskcon', 'ISKCON'],
  ['meditation', 'Meditation'],
  ['yoga', 'Yoga'],
  ['retreat', 'Retreat'],
  ['festival', 'Festival'],
  ['satsang', 'Satsang'],
  ['youth', 'Youth']
] as const;

async function main() {
  for (const [slug, name] of topics) {
    await prisma.topic.upsert({
      where: { slug },
      update: { name },
      create: { slug, name }
    });
  }

  const organizer = await prisma.organizer.upsert({
    where: { id: 'demo-organizer' },
    update: {},
    create: {
      id: 'demo-organizer',
      name: 'Demo Bhakti Community',
      contactEmail: 'organizer@example.com',
      websiteUrl: 'https://example.com',
      trustLevel: 'trusted'
    }
  });

  const source = await prisma.source.upsert({
    where: { id: 'demo-manual-source' },
    update: {},
    create: {
      id: 'demo-manual-source',
      organizerId: organizer.id,
      sourceType: SourceType.manual,
      sourceName: 'Manual Demo Submissions',
      authStatus: 'not_required',
      isActive: true
    }
  });

  const event = await prisma.event.upsert({
    where: { slug: 'demo-kirtan-gita-evening-montreal' },
    update: {},
    create: {
      sourceId: source.id,
      organizerId: organizer.id,
      sourceType: SourceType.manual,
      externalEventId: 'demo-1',
      slug: 'demo-kirtan-gita-evening-montreal',
      title: 'Kirtan & Bhagavad Gita Evening',
      shortDescription: 'A demo event showing how kirtan and Gita classes appear in the app.',
      description: 'Join us for mantra meditation, kirtan, vegetarian prasadam, and a short Bhagavad Gita discussion for youth and young professionals.',
      eventUrl: 'https://example.com/events/kirtan-gita-evening',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 2),
      timezone: 'America/Montreal',
      isOnline: false,
      venueName: 'Community Centre',
      address: 'Montreal, QC',
      city: 'Montreal',
      region: 'QC',
      country: 'Canada',
      status: 'published',
      qualityScore: 0.9
    }
  });

  const kirtan = await prisma.topic.findUniqueOrThrow({ where: { slug: 'kirtan' } });
  const gita = await prisma.topic.findUniqueOrThrow({ where: { slug: 'gita' } });
  const meditation = await prisma.topic.findUniqueOrThrow({ where: { slug: 'meditation' } });
  for (const topic of [kirtan, gita, meditation]) {
    await prisma.eventTopic.upsert({
      where: { eventId_topicId: { eventId: event.id, topicId: topic.id } },
      update: {},
      create: { eventId: event.id, topicId: topic.id }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
