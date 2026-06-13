import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { OR: [{ id }, { slug: id }], status: 'published' },
    include: { topics: { include: { topic: true } }, organizer: true }
  });
  if (!event) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ event });
}
