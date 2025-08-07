import { NextResponse } from 'next/server';
import { getGmailAuthUrl } from '@/lib/gmail/client';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const authUrl = await getGmailAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error getting Gmail auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}