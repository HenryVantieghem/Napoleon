import { currentUser } from '@clerk/nextjs/server';
import { getMessages } from '@/lib/messages';
import { getLiveMessages } from '@/lib/getLiveMessages';
import AutoRefresh from '@/components/dashboard/AutoRefresh';
import MessageCard from '@/components/dashboard/MessageCard';
import { hasGoogleToken } from '@/server/lib/google';
import { hasSlackToken } from '@/server/lib/slack';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await currentUser();
  const useMock = process.env.USE_MOCK === 'true';
  const messages = useMock ? getMessages() : await getLiveMessages(user?.id || '');
  const [googleConnected, slackConnected] = await Promise.all([
    hasGoogleToken(user?.id || ''),
    hasSlackToken(user?.id || ''),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inbox Intelligence</h2>
        <div className="text-sm opacity-70">Signed in as {user?.emailAddresses?.[0]?.emailAddress}</div>
      </div>
      <AutoRefresh intervalMs={30000} />
      {!googleConnected && !slackConnected && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <h3 className="font-medium mb-2">Connect Google</h3>
            <p className="text-sm opacity-70 mb-3">Connect Gmail to stream your recent messages.</p>
            <a className="underline" href={process.env.CLERK_SIGN_IN_URL || '#'}>Open Account Portal →</a>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-medium mb-2">Connect Slack</h3>
            <p className="text-sm opacity-70 mb-3">Connect Slack to stream your workspace messages.</p>
            <a className="underline" href={process.env.CLERK_SIGN_IN_URL || '#'}>Open Account Portal →</a>
          </div>
        </div>
      )}
      {messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((m) => <MessageCard key={m.id} msg={m} />)}
        </div>
      )}
      {messages.length === 0 && (googleConnected || slackConnected) && (
        <div className="text-sm opacity-70">No messages found from the past 7 days.</div>
      )}
    </main>
  );
}