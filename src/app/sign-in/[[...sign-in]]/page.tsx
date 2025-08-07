import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Napoleon AI</h1>
          <p className="text-gray-400">Sign in to access your intelligence dashboard</p>
        </div>
        <SignIn 
          redirectUrl="/prototype"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl',
              card: 'bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl rounded-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl',
              footerActionLink: 'text-purple-400 hover:text-purple-300',
              dividerLine: 'bg-white/20',
              dividerText: 'text-gray-400',
            },
          }}
        />
      </div>
    </div>
  )
}
