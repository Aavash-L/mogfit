import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Aura Lab',
  description: 'Privacy Policy for Aura Lab.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-sans font-bold text-[#F5F1EA] text-[16px]">{title}</h2>
      <div className="flex flex-col gap-2 font-sans text-[#8A8680] text-[14px] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#07070A] text-[#F5F1EA]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[rgba(255,241,234,0.06)]">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[13px] h-[13px] rounded-[3px] bg-white" />
          <span className="font-mono text-[12px] text-white tracking-[0.22em] font-bold">AURA LAB</span>
        </Link>
        <Link href="/" className="font-mono text-[11px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
          ← back
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] text-[#4A4742] tracking-[0.25em]">LEGAL</span>
          <h1 className="font-sans font-black text-white text-4xl tracking-tight">Privacy Policy</h1>
          <p className="font-sans text-[#4A4742] text-[13px]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <Section title="1. Information We Collect">
          <p><strong className="text-[#F5F1EA]">Account information:</strong> When you sign up, we collect your email address and any information provided through third-party authentication (e.g., name from Google OAuth).</p>
          <p><strong className="text-[#F5F1EA]">Usage data:</strong> We collect scan results, aura scores, and archetype data generated from your sessions. We do not associate uploaded images with your account.</p>
          <p><strong className="text-[#F5F1EA]">Payment data:</strong> Payments are processed by Stripe. We do not store credit card numbers or payment details on our servers.</p>
          <p><strong className="text-[#F5F1EA]">Cookies:</strong> We use a single cookie to track whether you have used your free scan. No third-party tracking cookies are used.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>To provide and operate the Service</li>
            <li>To process payments and manage your credit balance</li>
            <li>To display your scan results on the leaderboard (score and archetype only)</li>
            <li>To send transactional emails related to your account (e.g., purchase confirmation)</li>
            <li>To improve the Service and diagnose technical issues</li>
          </ul>
          <p>We do not sell your personal data to third parties. We do not use your data for advertising purposes.</p>
        </Section>

        <Section title="3. Image Data">
          <p>Photos you upload for scanning are transmitted securely to our AI provider (Anthropic) solely for the purpose of generating your aura reading. Images are not stored on our servers after processing is complete.</p>
          <p>We do not use uploaded images to train AI models, share them with third parties, or retain them beyond the duration of your scan request.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We share data only with the following service providers, solely as necessary to operate the Service:</p>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li><strong className="text-[#F5F1EA]">Supabase</strong> — database and authentication</li>
            <li><strong className="text-[#F5F1EA]">Anthropic</strong> — AI analysis of uploaded images</li>
            <li><strong className="text-[#F5F1EA]">Stripe</strong> — payment processing</li>
            <li><strong className="text-[#F5F1EA]">Vercel</strong> — hosting and infrastructure</li>
          </ul>
          <p>We may disclose information if required by law, legal process, or to protect the rights and safety of our users.</p>
        </Section>

        <Section title="5. Leaderboard and Public Data">
          <p>If you are logged in when you scan, your aura score, tier, and archetype name may appear on the public leaderboard. Your email address is never displayed publicly.</p>
          <p>You can contact us to request removal of your entries from the leaderboard at any time.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain your account data and scan history for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.</p>
          <p>Payment records are retained as required by applicable financial regulations.</p>
        </Section>

        <Section title="7. Your Rights">
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Data portability (receive your data in a structured format)</li>
          </ul>
          <p>To exercise any of these rights, contact us at <span className="text-[#F5F1EA]">support@auralab.app</span></p>
        </Section>

        <Section title="8. Security">
          <p>We implement industry-standard security measures including encryption in transit (HTTPS), secure authentication, and access controls. However, no system is 100% secure and we cannot guarantee absolute security.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>Aura Lab is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us immediately.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify registered users of material changes via email. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="11. Contact">
          <p>Privacy questions or requests? Contact us at <span className="text-[#F5F1EA]">support@auralab.app</span></p>
        </Section>

        <div className="pt-6 border-t border-[rgba(255,241,234,0.06)] flex gap-6">
          <Link href="/terms" className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] tracking-[0.14em] transition-colors">TERMS OF SERVICE</Link>
          <Link href="/" className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] tracking-[0.14em] transition-colors">BACK TO HOME</Link>
        </div>
      </div>
    </main>
  );
}
