'use client'

import { useState, useEffect } from 'react'

export default function TermsPage() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h) }, [])

  const font = '"SF Pro Display", -apple-system, system-ui, sans-serif'

  return (
    <div className="min-h-screen text-[#e4e4e7]" style={{ backgroundColor: '#09090b', fontFamily: font }}>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 40 ? 'backdrop-blur-xl' : ''}`} style={{ borderBottom: scrollY > 40 ? '1px solid #27272a' : '1px solid transparent', backgroundColor: scrollY > 40 ? 'rgba(9,9,11,0.85)' : 'transparent' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-[24px] tracking-tight"><span className="font-light">Tempo</span><span className="text-emerald-400 font-semibold">Read</span></a>
          <a href="/app" className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-semibold text-[13px] text-black shadow-lg transition-all hover:scale-[1.02] min-h-[40px] flex items-center">Open App</a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-28 pb-20">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[13px] text-[#52525b] mb-12">Last updated: 23 March 2026</p>

        <div className="space-y-8 text-[14px] leading-relaxed text-[#a1a1aa]">
          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using TempoRead ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. TempoRead is operated by Idir Mazir ("we", "us", "our") from Perth, Western Australia.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">2. Description of Service</h2>
            <p>TempoRead is a web-based speed reading application using RSVP (Rapid Serial Visual Presentation) technology. The Service allows users to upload documents, paste text, and read content at adjustable speeds. We offer both free and paid subscription tiers.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">3. Accounts</h2>
            <p>You may use limited features without an account. To access Pro features, you must create an account with a valid email address or sign in via Google. You are responsible for maintaining the security of your account credentials. You must be at least 16 years old to create an account.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">4. Subscriptions & Payments</h2>
            <p className="mb-2">TempoRead Pro is available as a monthly ($5 AUD/month) or annual ($35 AUD/year) subscription. Payments are processed securely by Stripe. By subscribing, you agree to the following:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li>Subscriptions automatically renew at the end of each billing period unless cancelled.</li>
              <li>You may cancel at any time through the "Manage Plan" option in the app. Cancellation takes effect at the end of the current billing period.</li>
              <li>Refunds are handled on a case-by-case basis. Contact us within 7 days of a charge for refund requests.</li>
              <li>We reserve the right to change pricing with 30 days' notice to active subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">5. User Content</h2>
            <p>You retain ownership of all text and documents you upload to TempoRead. We do not claim any intellectual property rights over your content. Documents stored in your library are associated with your account and accessible only to you. We do not read, analyse, sell, or share your uploaded content.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">6. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Upload content that infringes on third-party intellectual property rights.</li>
              <li>Attempt to gain unauthorised access to other users' accounts or data.</li>
              <li>Interfere with or disrupt the Service or its infrastructure.</li>
              <li>Use automated scripts or bots to access the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">7. Service Availability</h2>
            <p>We strive to maintain high availability but do not guarantee uninterrupted access. The Service is provided "as is" without warranties of any kind, express or implied. We may modify, suspend, or discontinue features at any time with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by Australian law, TempoRead and its operator shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">9. Termination</h2>
            <p>We may terminate or suspend your account at our discretion if you violate these Terms. You may delete your account at any time by contacting us. Upon termination, your stored documents and reading data will be deleted.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">10. Governing Law</h2>
            <p>These Terms are governed by the laws of Western Australia. Any disputes shall be resolved in the courts of Western Australia.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify active users of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">12. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@temporead.app" className="text-emerald-400 hover:underline">support@temporead.app</a>.</p>
          </section>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #27272a' }} className="py-8">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[20px] tracking-tight"><span className="font-light">Tempo</span><span className="text-emerald-400 font-semibold">Read</span></div>
          <div className="flex items-center gap-6 text-[12px] text-[#52525b]">
            <a href="/terms" className="text-[#a1a1aa]">Terms</a>
            <a href="/privacy" className="hover:text-[#a1a1aa] transition-colors">Privacy</a>
            <a href="/app" className="hover:text-[#a1a1aa] transition-colors">App</a>
          </div>
          <div className="text-[11px] text-[#3f3f46]">&copy; 2026 TempoRead</div>
        </div>
      </footer>
    </div>
  )
}
