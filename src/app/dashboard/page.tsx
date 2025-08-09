import AutoRefresh from '@/components/dashboard/AutoRefresh';
import MessageCard from '@/components/dashboard/MessageCard';
import { getMessages } from '@/lib/messages';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const useMock = process.env.USE_MOCK === 'true';
  let messages = getMessages();
  if (!useMock) {
    try {
      const { getLiveMessages } = await import('@/lib/getLiveMessages');
      messages = await getLiveMessages();
    } catch {
      messages = getMessages();
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inbox Intelligence</h2>
        <span className="text-sm opacity-70">{useMock ? 'Mock data' : 'Live'}</span>
      </div>
      <div className="flex items-center gap-3">
        <AutoRefresh intervalMs={30000} />
        <form action="/dashboard">
          <button className="rounded-2xl px-3 py-1 border text-sm" formAction="/dashboard">Refresh now</button>
        </form>
      </div>
      {messages.length === 0 ? (
        <div className="text-sm opacity-70">No messages found from the past 7 days.</div>
      ) : (
        <div className="space-y-3">{messages.map((m) => <MessageCard key={m.id} msg={m} />)}</div>
      )}
    </main>
  );
}