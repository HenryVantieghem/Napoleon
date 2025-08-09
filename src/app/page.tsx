import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Napoleon AI</h1>
        <SignedIn><UserButton /></SignedIn>
      </header>

      <SignedOut>
        <div className="space-y-4">
          <p className="text-lg">Executive-grade message intelligence.</p>
          <SignInButton mode="modal">
            <button className="rounded-2xl px-4 py-2 border">Sign in</button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="space-y-4">
          <p className="text-lg">Welcome back. Head to your dashboard.</p>
          <Link className="underline" href="/dashboard">Go to Dashboard →</Link>
        </div>
      </SignedIn>
    </main>
  );
}