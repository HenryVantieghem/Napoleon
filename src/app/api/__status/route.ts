export const runtime = 'nodejs'

const has = (k: string) => Boolean(process.env[k])

export async function GET() {
  const summary = {
    envs: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: has('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
      CLERK_SECRET_KEY: has('CLERK_SECRET_KEY'),
      CLERK_SIGN_IN_URL: has('CLERK_SIGN_IN_URL'),
      CLERK_SIGN_UP_URL: has('CLERK_SIGN_UP_URL'),
      CLERK_AFTER_SIGN_IN_URL: has('CLERK_AFTER_SIGN_IN_URL'),
      CLERK_AFTER_SIGN_UP_URL: has('CLERK_AFTER_SIGN_UP_URL'),
      NEXT_PUBLIC_APP_URL: has('NEXT_PUBLIC_APP_URL'),
      USE_MOCK: process.env.USE_MOCK ?? 'undefined',
    },
    runtime: 'nodejs',
    now: Date.now(),
  }
  return Response.json(summary)
}


