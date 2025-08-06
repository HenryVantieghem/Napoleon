'use client'

import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Napoleon AI
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-300" />
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-indigo-100 mt-2">Executive-grade data protection and privacy practices</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* Last Updated */}
          <div className="text-sm text-gray-600 border-b pb-4">
            <p><strong>Last Updated:</strong> August 6, 2025</p>
            <p><strong>Effective Date:</strong> August 6, 2025</p>
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Napoleon AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and maintaining the confidentiality 
              of your executive communications. This Privacy Policy explains how we collect, use, protect, and handle your 
              information when you use our executive email intelligence platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-900 mb-3">Authentication Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use Clerk Authentication to manage user accounts. This includes your email address, 
              authentication tokens, and basic profile information necessary for secure access to our platform.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mb-3">Gmail API Data Access</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              With your explicit consent, Napoleon AI accesses your Gmail data through Google&apos;s Gmail API to provide 
              email intelligence services. We access:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Email metadata (sender, subject, timestamp)</li>
              <li>Email content for priority classification and analysis</li>
              <li>Message organization data (labels, threads)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">Slack Integration Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When configured, we may access Slack workspace data through authorized bot tokens to provide 
              unified communication intelligence.
            </p>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide intelligent email prioritization and classification services</li>
              <li>Generate executive communication insights and analytics</li>
              <li>Authenticate and secure your account access</li>
              <li>Improve our AI algorithms and service quality</li>
              <li>Provide customer support and technical assistance</li>
            </ul>
          </section>

          {/* Data Security and Storage */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security and Storage</h2>
            
            <h3 className="text-lg font-medium text-gray-900 mb-3">Security Measures</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement enterprise-grade security measures including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>End-to-end encryption for data transmission</li>
              <li>Secure OAuth 2.0 authentication protocols</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and monitoring systems</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">Data Retention</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Important:</strong> Napoleon AI does not permanently store your email content. 
              Email data is processed in real-time for analysis and priority scoring, then discarded. 
              We only retain:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Authentication tokens (encrypted and securely stored)</li>
              <li>User account information</li>
              <li>Aggregated, anonymized usage analytics</li>
              <li>Service configuration preferences</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Napoleon AI integrates with the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Google Gmail API:</strong> For accessing and analyzing your email data</li>
              <li><strong>Clerk Authentication:</strong> For secure user authentication and account management</li>
              <li><strong>OpenAI:</strong> For AI-powered email analysis and prioritization</li>
              <li><strong>Vercel:</strong> For secure cloud hosting and deployment</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request information about data we have about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Revocation:</strong> Revoke Gmail API access permissions at any time</li>
              <li><strong>Portability:</strong> Request export of your account data</li>
              <li><strong>Opt-out:</strong> Opt out of non-essential data processing</li>
            </ul>
          </section>

          {/* Google API Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Google API Services User Data Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Napoleon AI&apos;s use and transfer of information received from Google APIs adheres to the 
              <a href="https://developers.google.com/terms/api-services-user-data-policy" 
                 className="text-indigo-600 hover:text-indigo-700 underline" 
                 target="_blank" 
                 rel="noopener noreferrer">
                Google API Services User Data Policy
              </a>, including the Limited Use requirements.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We only request the minimum necessary Gmail permissions and use your Gmail data solely 
              for providing our executive email intelligence services.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For privacy-related inquiries, questions, or requests, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 font-medium">Email: <a href="mailto:privacy@napoleonai.app" className="text-indigo-600 hover:text-indigo-700">privacy@napoleonai.app</a></p>
              <p className="text-gray-700 font-medium">Support: <a href="mailto:support@napoleonai.app" className="text-indigo-600 hover:text-indigo-700">support@napoleonai.app</a></p>
              <p className="text-gray-700">Response Time: Within 48 hours for executive accounts</p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Updates</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices or for legal reasons. 
              We will notify users of significant changes via email or through our platform. Continued use of 
              Napoleon AI after policy updates constitutes acceptance of the revised terms.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}