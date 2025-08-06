'use client'

import Link from 'next/link'
import { Scale, ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
            <Scale className="w-8 h-8 text-yellow-300" />
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-indigo-100 mt-2">Professional terms for executive email intelligence platform</p>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Napoleon AI 
              (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) regarding your use of our executive email intelligence platform and services. 
              By accessing or using Napoleon AI, you agree to be bound by these Terms.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Napoleon AI is an executive email intelligence platform designed for Fortune 500 leaders and C-level executives. 
              Our service provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>AI-powered email prioritization and classification</li>
              <li>Executive communication analytics and insights</li>
              <li>Unified inbox management across Gmail and Slack</li>
              <li>Real-time message processing and priority scoring</li>
              <li>Executive dashboard with communication intelligence</li>
            </ul>
          </section>

          {/* User Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use Napoleon AI, you must:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal authority to enter into this agreement</li>
              <li>Hold an executive or leadership position requiring email intelligence</li>
              <li>Maintain active Gmail and/or Slack accounts for integration</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities and Conduct</h2>
            
            <h3 className="text-lg font-medium text-gray-900 mb-3">Acceptable Use</h3>
            <p className="text-gray-700 leading-relaxed mb-4">You agree to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Use the service only for legitimate business and executive communication purposes</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Provide accurate and current information</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Comply with all applicable privacy and data protection laws</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">Prohibited Activities</h3>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
              <li>Use the service for illegal, harmful, or fraudulent purposes</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
            </ul>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data and Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your use of Napoleon AI is also governed by our Privacy Policy, which is incorporated by reference into these Terms. 
              By using our service, you consent to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Our access to your Gmail data through authorized API connections</li>
              <li>Processing of your email and communication data for AI analysis</li>
              <li>Use of aggregated, anonymized data for service improvement</li>
              <li>Implementation of enterprise-grade security measures</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property Rights</h2>
            
            <h3 className="text-lg font-medium text-gray-900 mb-3">Our Intellectual Property</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Napoleon AI, including its software, algorithms, user interface, and all related intellectual property, 
              is owned by the Company and protected by copyright, trademark, and other intellectual property laws. 
              You are granted a limited, non-exclusive, non-transferable license to use our service.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mb-3">Your Content</h3>
            <p className="text-gray-700 leading-relaxed">
              You retain ownership of your email content and communications. By using our service, you grant us 
              a limited license to process and analyze your data solely for providing our AI intelligence services.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability and Modifications</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive to maintain high service availability but cannot guarantee uninterrupted access. We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Perform scheduled maintenance and updates</li>
              <li>Modify or discontinue features with reasonable notice</li>
              <li>Suspend service for security or technical reasons</li>
              <li>Update these Terms with notification to users</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, Napoleon AI and its affiliates shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Service interruptions or technical difficulties</li>
              <li>Third-party actions or content</li>
              <li>Any damages exceeding the fees paid for the service in the preceding 12 months</li>
            </ul>
            <p className="text-gray-700 leading-relaxed text-sm">
              Some jurisdictions do not allow the exclusion or limitation of certain damages, 
              so these limitations may not apply to you.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Napoleon AI and its officers, directors, employees, 
              and agents from any claims, damages, costs, or expenses (including reasonable attorneys&apos; fees) 
              arising from your use of the service, violation of these Terms, or infringement of third-party rights.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Either party may terminate this agreement at any time:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>By You:</strong> By discontinuing use and deleting your account</li>
              <li><strong>By Us:</strong> For violation of these Terms or at our discretion with notice</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, your access will cease, and we will delete your account data in accordance 
              with our Privacy Policy and applicable law.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
              United States, without regard to conflict of law principles. Any disputes arising under these Terms 
              shall be subject to the exclusive jurisdiction of the state and federal courts located in Delaware.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 font-medium">Legal: <a href="mailto:legal@napoleonai.app" className="text-indigo-600 hover:text-indigo-700">legal@napoleonai.app</a></p>
              <p className="text-gray-700 font-medium">Support: <a href="mailto:support@napoleonai.app" className="text-indigo-600 hover:text-indigo-700">support@napoleonai.app</a></p>
              <p className="text-gray-700">Business Hours: Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Severability and Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force. 
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Napoleon AI 
              regarding your use of our service.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}