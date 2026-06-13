import { prisma } from '@/lib/prisma';
import SubmitEventForm from './submit-event-form';

export default async function SubmitEventPage() {
  const topics = await prisma.topic.findMany({ orderBy: { name: 'asc' } });
  return (
    <main className="container">
      <h1>Submit a spiritual event</h1>
      <p className="notice">
        Facebook notice: submit only events you have permission to share. The app does not fetch private Facebook groups, private events, member-only content, or personal Facebook data.
      </p>
      <SubmitEventForm topics={topics} />
    </main>
  );
}
