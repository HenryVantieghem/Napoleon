import { currentUser } from '@clerk/nextjs/server';
import { getMessages } from '@/lib/messages';
import AutoRefresh from '@/components/dashboard/AutoRefresh';
import MessageCard from '@/components/dashboard/MessageCard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await currentUser();
  const messages = getMessages();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inbox Intelligence</h2>
        <div className="text-sm opacity-70">Signed in as {user?.emailAddresses?.[0]?.emailAddress}</div>
      </div>
      <AutoRefresh intervalMs={30000} />
      <div className="space-y-3">
        {messages.map((m) => <MessageCard key={m.id} msg={m} />)}
      </div>
    </main>
  );
}