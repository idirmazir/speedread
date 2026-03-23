'use client'

import { useState, useEffect } from 'react'

export default function PrivacyPage() {
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
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[13px] text-[#52525b] mb-12">Last updated: 23 March 2026</p>

        <div className="space-y-8 text-[14px] leading-relaxed text-[#a1a1aa]">
          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">1. Overview</h2>
            <p>TempoRead ("the Service") is operated by Idir Mazir from Perth, Western Australia. We are committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how we handle it.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">2. Data We Collect</h2>
            <p className="mb-3">We collect the minimum data necessary to provide the Service:</p>
            <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
              <h3 className="text-[13px] font-semibold text-[#e4e4e7] mb-2">Account Data</h3>
              <ul className="list-disc list-inside space-y-1 text-[13px]">
                <li>Email address (for authentication)</li>
                <li>Google profile information (if using Google sign-in: name and email only)</li>
                <li>Subscription status and Stripe customer ID (for billing)</li>
              </ul>
            </div>
            <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
              <h3 className="text-[13px] font-semibold text-[#e4e4e7] mb-2">Usage Data</h3>
              <ul className="list-disc list-inside space-y-1 text-[13px]">
                <li>Documents you upload or paste (stored in your library, only accessible by you)</li>
                <li>Reading session statistics (words read, duration, average WPM)</li>
                <li>Reading progress and position within documents</li>
                <li>Preference settings (theme, font, speed)</li>
              </ul>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
              <h3 className="text-[13px] font-semibold text-[#e4e4e7] mb-2">Data We Do NOT Collect</h3>
              <ul className="list-disc list-inside space-y-1 text-[13px]">
                <li>We do not use cookies for tracking or advertising</li>
                <li>We do not collect location data</li>
                <li>We do not use analytics trackers (no Google Analytics, no Meta Pixel)</li>
                <li>We do not sell or share your data with third parties for marketing</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li>To provide and maintain the Service (authentication, document storage, reading analytics)</li>
              <li>To process payments via Stripe</li>
              <li>To communicate with you about your account or service changes</li>
              <li>To improve the Service based on aggregate, anonymised usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">4. Data Storage & Security</h2>
            <p className="mb-2">Your data is stored securely using the following services:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li><strong className="text-[#e4e4e7]">Supabase</strong> — authentication and database (hosted on AWS, data encrypted at rest and in transit)</li>
              <li><strong className="text-[#e4e4e7]">Stripe</strong> — payment processing (PCI DSS Level 1 compliant — we never see or store your card details)</li>
              <li><strong className="text-[#e4e4e7]">Vercel</strong> — application hosting</li>
            </ul>
            <p className="mt-2">All data transmission uses HTTPS/TLS encryption. Database access is restricted via Row Level Security (RLS) — users can only access their own data.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">5. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services that may process your data:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li><strong className="text-[#e4e4e7]">Supabase</strong> — <a href="https://supabase.com/privacy" className="text-emerald-400 hover:underline">Privacy Policy</a></li>
              <li><strong className="text-[#e4e4e7]">Stripe</strong> — <a href="https://stripe.com/au/privacy" className="text-emerald-400 hover:underline">Privacy Policy</a></li>
              <li><strong className="text-[#e4e4e7]">Google</strong> (OAuth sign-in only) — <a href="https://policies.google.com/privacy" className="text-emerald-400 hover:underline">Privacy Policy</a></li>
              <li><strong className="text-[#e4e4e7]">Vercel</strong> — <a href="https://vercel.com/legal/privacy-policy" className="text-emerald-400 hover:underline">Privacy Policy</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">6. Your Rights</h2>
            <p className="mb-2">Under the Australian Privacy Act 1988, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li><strong className="text-[#e4e4e7]">Access</strong> — request a copy of your personal data</li>
              <li><strong className="text-[#e4e4e7]">Correction</strong> — request correction of inaccurate data</li>
              <li><strong className="text-[#e4e4e7]">Deletion</strong> — request deletion of your account and all associated data</li>
              <li><strong className="text-[#e4e4e7]">Portability</strong> — request export of your documents and reading data</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:support@temporead.app" className="text-emerald-400 hover:underline">support@temporead.app</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, all personal data and documents are permanently deleted within 30 days. Anonymised, aggregate analytics data may be retained indefinitely.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">8. Children's Privacy</h2>
            <p>TempoRead is not intended for children under 16. We do not knowingly collect data from children under 16. If you believe a child has provided us with personal data, contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify active users of material changes via email. The "Last updated" date at the top reflects the most recent revision.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#e4e4e7] mb-3">10. Contact</h2>
            <p>For privacy-related questions or requests, contact us at <a href="mailto:support@temporead.app" className="text-emerald-400 hover:underline">support@temporead.app</a>.</p>
          </section>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #27272a' }} className="py-8">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[20px] tracking-tight"><span className="font-light">Tempo</span><span className="text-emerald-400 font-semibold">Read</span></div>
          <div className="flex items-center gap-6 text-[12px] text-[#52525b]">
            <a href="/terms" className="hover:text-[#a1a1aa] transition-colors">Terms</a>
            <a href="/privacy" className="text-[#a1a1aa]">Privacy</a>
            <a href="/app" className="hover:text-[#a1a1aa] transition-colors">App</a>
          </div>
          <div className="text-[11px] text-[#3f3f46]">&copy; 2026 TempoRead</div>
        </div>
      </footer>
    </div>
  )
}
