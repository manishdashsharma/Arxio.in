import LegalLayout from "../components/LegalLayout";

export const metadata = {
  title: "Terms of Service — Arxio",
  description: "Terms of Service for Arxio (arxio.in). Read before using our platform.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="By using Arxio, you agree to these terms. Please read them carefully."
      lastUpdated="April 26, 2026"
    >
      <div className="callout">
        <p>These Terms govern your use of Arxio (arxio.in). If you are under 18, you confirm that you have parental consent to use this service.</p>
      </div>

      <h2>1. Who We Are</h2>
      <p>Arxio (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an AI-powered research assistant available at <strong>arxio.in</strong>. We provide tools to help students and researchers analyse research papers, generate presentations, and synthesise information from the web.</p>

      <h2>2. Your Account</h2>
      <p>To access most features, you must create an account. You are responsible for:</p>
      <ul>
        <li>Keeping your login credentials secure and confidential</li>
        <li>All activity that occurs under your account</li>
        <li>Notifying us immediately at <strong>support@arxio.in</strong> if you suspect unauthorised access</li>
        <li>Providing accurate and truthful information when signing up</li>
      </ul>
      <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>

      <h2>3. What You Can Upload</h2>
      <p>You may upload PDF files of research papers, academic articles, reports, and similar documents. By uploading content, you confirm that:</p>
      <ul>
        <li>You have the legal right to upload and process the document</li>
        <li>The document does not contain malware, illegal content, or material that violates third-party rights</li>
        <li>You are not uploading confidential documents belonging to another person or organisation without authorisation</li>
        <li>Files do not exceed 50MB and 50 pages per upload</li>
      </ul>
      <p>We do not claim ownership of your uploaded documents. Your files remain yours.</p>

      <h2>4. AI-Generated Content</h2>
      <p>Arxio uses artificial intelligence (OpenAI GPT-4o and GPT-4o-mini) to analyse your documents and generate presentations, summaries, Q&A prep, and other outputs. You understand that:</p>
      <ul>
        <li>AI-generated content may contain inaccuracies, errors, or omissions</li>
        <li>You are responsible for reviewing outputs before using them in academic or professional settings</li>
        <li>Arxio outputs are tools to assist your work, not replacements for your own understanding</li>
        <li>We do not guarantee that any output is factually accurate, complete, or fit for a specific purpose</li>
        <li>Using Arxio outputs in academic submissions is subject to your institution&apos;s academic integrity policies — check with your institution</li>
      </ul>

      <h2>5. Subscription Plans and Payments</h2>
      <p>Arxio offers four plans: Free, Student ($9/mo), Pro ($19/mo), and Scholar ($39/mo). Paid plans are billed monthly. By subscribing to a paid plan:</p>
      <ul>
        <li>You authorise us to charge your payment method on a recurring monthly basis</li>
        <li>Subscriptions renew automatically unless cancelled before the renewal date</li>
        <li>Plan limits (PDFs per month, chat messages, etc.) reset on the 1st of each calendar month</li>
        <li>Unused quota does not roll over to the next month</li>
        <li>We reserve the right to change plan pricing with 30 days&apos; notice to existing subscribers</li>
      </ul>

      <h2>6. Refunds</h2>
      <p>Please refer to our <a href="/refund">Refund Policy</a> for full details. In summary, we offer a 7-day refund window for new paid subscriptions if you are unsatisfied and have processed fewer than 5 documents.</p>

      <h2>7. Free Plan Limits</h2>
      <p>The Free plan includes 3 PDF uploads per month, 5 research topics, and 10 chat messages. Free plan workspaces are retained for 7 days only. After 7 days, workspaces and generated files from free accounts may be permanently deleted. We are not liable for any data loss after this retention period.</p>

      <h2>8. Prohibited Use</h2>
      <p>You must not use Arxio to:</p>
      <ul>
        <li>Upload or process content that is illegal, defamatory, or infringes on intellectual property rights</li>
        <li>Attempt to reverse-engineer, scrape, or extract our AI models or proprietary systems</li>
        <li>Use automated scripts or bots to access the platform at scale without written permission</li>
        <li>Resell or sublicense access to Arxio without written authorisation</li>
        <li>Upload documents containing personal data of others without their consent</li>
        <li>Circumvent usage limits by creating multiple accounts</li>
      </ul>

      <h2>9. Intellectual Property</h2>
      <p>The Arxio platform, interface, branding, and underlying systems are owned by us and protected by applicable intellectual property laws. You retain ownership of your uploaded documents. You grant us a limited, non-exclusive licence to process your uploaded content solely to provide the service.</p>
      <p>AI-generated outputs (presentations, cheat sheets, Q&A prep, etc.) created from your documents are yours to use for personal and academic purposes.</p>

      <h2>10. Service Availability</h2>
      <p>We aim for high availability but do not guarantee uninterrupted access. AI processing times depend on model availability and may vary. We are not liable for losses caused by downtime, processing failures, or errors in AI-generated content.</p>

      <h2>11. Termination</h2>
      <p>You may delete your account at any time from Settings. We may suspend or terminate your account if you violate these Terms. On termination, your data will be deleted according to our Privacy Policy.</p>

      <h2>12. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, Arxio shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the platform, including but not limited to academic consequences from using AI-generated content.</p>

      <h2>13. Changes to These Terms</h2>
      <p>We may update these Terms from time to time. We will notify registered users by email at least 14 days before material changes take effect. Continued use of Arxio after the effective date constitutes acceptance of the updated Terms.</p>

      <h2>14. Contact</h2>
      <p>Questions about these Terms? Email us at <strong>support@arxio.in</strong>. We aim to respond within 2 business days.</p>
    </LegalLayout>
  );
}
