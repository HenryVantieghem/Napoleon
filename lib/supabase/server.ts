import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export const getSupabaseServerClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // This is a no-op in server components
          // Cookie setting happens in middleware/route handlers
        },
        remove(name: string, options: CookieOptions) {
          // This is a no-op in server components  
          // Cookie removal happens in middleware/route handlers
        },
      },
    }
  )
}