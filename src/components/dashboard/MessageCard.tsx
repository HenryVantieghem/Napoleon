import { type Msg } from '@/lib/priority';

export default function MessageCard({ msg }: { msg: Msg }) {
  return (
    <article className="rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase opacity-60">{msg.source}</span>
        <time className="text-xs opacity-60">{new Date(msg.ts).toLocaleString()}</time>
      </div>
      <div className="mt-2 text-sm opacity-80">{msg.from}</div>
      {msg.subject && <h3 className="mt-1 font-medium">{msg.subject}</h3>}
      <p className="mt-1 text-sm">{msg.text}</p>
    </article>
  );
}


