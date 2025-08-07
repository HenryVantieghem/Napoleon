import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Napoleon AI</h1>
          <p className="text-blue-200">Sign in to access your intelligence dashboard</p>
        </div>
        <SignIn 
          redirectUrl="/prototype"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-white text-blue-700 hover:bg-blue-50',
              card: 'bg-white/95 backdrop-blur-sm shadow-2xl',
            },
          }}
        />
      </div>
    </div>
  )
}
