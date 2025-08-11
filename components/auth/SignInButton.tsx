'use client'

import { SignInButton as ClerkSignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare } from 'lucide-react'

export function SignInButton() {
  return (
    <>
      <SignedOut>
        <ClerkSignInButton mode="modal">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <Mail className="w-5 h-5 mr-3" />
            Start Your Executive Dashboard
          </Button>
        </ClerkSignInButton>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center gap-4">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => window.location.href = '/dashboard'}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Your Executive Dashboard
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