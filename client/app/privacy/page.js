import LegalLayout from "../components/LegalLayout";

export const metadata = {
  title: "Privacy Policy — Arxio",
  description: "Privacy Policy for Arxio (arxio.in). How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="We believe your research is yours. Here is exactly how we handle your data."
      lastUpdated="April 26, 2026"
    >
      <div className="callout">
        <p>This Privacy Policy explains how Arxio collects, uses, and protects your personal data. By using Arxio, you agree to the practices described here.</p>
      </div>

      <h2>1. Who We Are</h2>
      <p>Arxio (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an AI-powered research assistant operated at <strong>arxio.in</strong>. For any privacy-related questions, contact us at <strong>privacy@arxio.in</strong>.</p>

      <h2>2. Data We Collect</h2>
      <p>We collect only what is necessary to provide the service:</p>
      <h3>Account Data</h3>
      <ul>
        <li>Name, email address, and hashed password when you sign up</li>
        <li>Google profile information if you sign in with Google (name, email, profile photo)</li>
        <li>Subscription tier and billing history (payment card details are handled by Stripe — we never store them)</li>
      </ul>
      <h3>Usage Data</h3>
      <ul>
        <li>PDFs you upload and the text extracted from them for processing</li>
        <li>Research topics you submit</li>
        <li>Chat messages you send within workspaces</li>
        <li>Documents and presentations generated in your account</li>
        <li>Feature usage counts (PDFs processed, messages sent) for plan limit enforcement</li>
      </ul>
      <h3>Technical Data</h3>
      <ul>
        <li>IP address and browser user-agent for security and abuse prevention</li>
        <li>Server-side logs of API requests (retained for 30 days)</li>
        <li>Error logs for debugging (stripped of document content)</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <p>We use the data we collect to:</p>
      <ul>
        <li>Process your uploaded PDFs and generate all workspace outputs</li>
        <li>Conduct web research when you use Research Mode</li>
        <li>Provide the chat assistant with context about your uploaded documents</li>
        <li>Enforce your plan&apos;s usage limits and reset them monthly</li>
        <li>Send transactional emails — account confirmations, password resets, plan receipts</li>
        <li>Notify you of material changes to these policies (minimum 14 days notice)</li>
        <li>Detect and prevent fraud, abuse, and security threats</li>
      </ul>
      <p>We do not use your uploaded documents or generated content to train AI models. We do not sell your data to any third party.</p>

      <h2>4. Third-Party Services</h2>
      <p>Arxio integrates with the following third-party services to deliver its features. Each has its own privacy policy:</p>
      <ul>
        <li><strong>Groq API</strong> — AI processing for Free and Student plans (document content is sent to Groq for analysis)</li>
        <li><strong>OpenAI</strong> — AI processing for Pro and Scholar plans (document content is sent to OpenAI for analysis)</li>
        <li><strong>Tavily</strong> — Web search for Research Mode (search queries only, no document content)</li>
        <li><strong>Cloudflare R2</strong> — Encrypted storage for uploaded PDFs and generated files</li>
        <li><strong>MongoDB Atlas</strong> — Database hosting for account and workspace metadata</li>
        <li><strong>Stripe</strong> — Payment processing (Stripe handles all card data; we receive only masked card info and subscription status)</li>
        <li><strong>Google OAuth</strong> — Optional sign-in via Google account</li>
        <li><strong>Qdrant</strong> — Vector database for Scholar plan RAG features (document embeddings stored, not raw text)</li>
      </ul>

      <h2>5. Data Storage and Security</h2>
      <p>Your data is stored on servers hosted in the EU and US. We implement the following security measures:</p>
      <ul>
        <li>All data in transit is encrypted using TLS 1.2 or higher</li>
        <li>Passwords are hashed using bcrypt — we never store plain-text passwords</li>
        <li>Uploaded PDFs and generated files are stored in Cloudflare R2 with access controlled by signed URLs</li>
        <li>Database access is restricted to application servers only — no public access</li>
        <li>JWT authentication tokens expire after 7 days and are refreshed securely</li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>How long we keep your data depends on your plan:</p>
      <ul>
        <li><strong>Free plan</strong> — Workspaces and generated files are retained for 7 days, then permanently deleted</li>
        <li><strong>Student plan</strong> — Workspaces and files retained for 180 days from last activity</li>
        <li><strong>Pro and Scholar plans</strong> — Workspaces and files retained indefinitely while the account is active</li>
        <li><strong>All plans</strong> — Account data (name, email, subscription history) is retained until you delete your account</li>
        <li>After account deletion, all personal data is permanently removed within 30 days</li>
      </ul>

      <h2>7. Your Rights</h2>
      <p>You have the following rights over your data:</p>
      <ul>
        <li><strong>Access</strong> — Request a copy of all personal data we hold about you</li>
        <li><strong>Correction</strong> — Update your name, email, or other account details at any time from Settings</li>
        <li><strong>Deletion</strong> — Delete your account and all associated data from Settings → Delete Account</li>
        <li><strong>Export</strong> — Download all your generated documents and uploaded PDFs at any time</li>
        <li><strong>Portability</strong> — Request a machine-readable export of your account data by emailing <strong>privacy@arxio.in</strong></li>
        <li><strong>Objection</strong> — Object to any processing not strictly necessary for service delivery</li>
      </ul>
      <p>To exercise any right, email <strong>privacy@arxio.in</strong>. We will respond within 14 days.</p>

      <h2>8. Cookies</h2>
      <p>Arxio uses strictly necessary cookies only:</p>
      <ul>
        <li><strong>Session cookie</strong> — Keeps you logged in between page loads (expires when you close the browser or after 7 days)</li>
        <li><strong>CSRF token</strong> — Protects against cross-site request forgery attacks</li>
      </ul>
      <p>We do not use advertising cookies, tracking pixels, or analytics services that track you across other websites.</p>

      <h2>9. Children&apos;s Privacy</h2>
      <p>Arxio is not directed at children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us with personal data, contact us at <strong>privacy@arxio.in</strong> and we will delete it promptly.</p>

      <h2>10. Changes to This Policy</h2>
      <p>We may update this Privacy Policy when our practices change. We will notify registered users by email at least 14 days before material changes take effect. The updated date at the top of this page always reflects the most recent revision.</p>

      <h2>11. Contact</h2>
      <p>For any privacy questions or requests, email <strong>privacy@arxio.in</strong>. We aim to respond within 2 business days.</p>
    </LegalLayout>
  );
}
