import { type Msg, prioritize } from '@/lib/priority'

// MVP stub (Phase 2 will fetch live via Clerk tokens)
export async function getLiveMessages(): Promise<Msg[]> {
  return prioritize([])
}


