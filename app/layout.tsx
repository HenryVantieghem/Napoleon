import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Napoleon AI - Unified Message Dashboard',
  description: 'View Gmail and Slack messages in one unified stream',
  keywords: ['email', 'slack', 'dashboard', 'productivity', 'messages'],
  authors: [{ name: 'Napoleon AI' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Napoleon AI - Unified Message Dashboard',
    description: 'View Gmail and Slack messages in one unified stream',
    url: 'https://napoleonai.app',
    siteName: 'Napoleon AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Napoleon AI - Unified Message Dashboard',
    description: 'View Gmail and Slack messages in one unified stream',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}