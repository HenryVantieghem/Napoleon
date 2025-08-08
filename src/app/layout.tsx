import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Napoleon AI - Enterprise Intelligence Platform',
  description: 'Transform executive communications into strategic clarity with military-grade AI intelligence. Stream Gmail and Slack messages with smart prioritization.',
  keywords: ['AI', 'Enterprise', 'Email Intelligence', 'Slack Integration', 'Executive Dashboard', 'Communication Analysis'],
  authors: [{ name: 'Napoleon AI' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
  openGraph: {
    title: 'Napoleon AI - Enterprise Intelligence Platform',
    description: 'Military-grade AI intelligence for executive communications',
    url: 'https://napoleonai.app',
    siteName: 'Napoleon AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Napoleon AI - Enterprise Intelligence Platform',
    description: 'Military-grade AI intelligence for executive communications',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body className={`${inter.className} antialiased`}>
          <main className="min-h-screen">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
              }
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}