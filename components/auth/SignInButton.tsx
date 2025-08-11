'use client'

import { SignInButton as ClerkSignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare } from 'lucide-react'

export function SignInButton() {
  return (
    <>
      <SignedOut>
        <ClerkSignInButton mode="modal">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            <Mail className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>
        </ClerkSignInButton>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center gap-4">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => window.location.href = '/dashboard'}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            View Dashboard
          </Button>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
            afterSignOutUrl="/"
          />
        </div>
      </SignedIn>
    </>
  )
}