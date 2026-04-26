import LegalLayout from "../components/LegalLayout";

export const metadata = {
  title: "Refund Policy — Arxio",
  description: "Refund Policy for Arxio (arxio.in). 7-day refund window for new paid subscriptions.",
};

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      subtitle="We want you to be confident when you upgrade. Here is our commitment."
      lastUpdated="April 26, 2026"
    >
      <div className="callout">
        <p>Arxio offers a 7-day refund for new paid subscriptions if you are unsatisfied and have processed fewer than 5 documents. No hoops, no awkward questions.</p>
      </div>

      <h2>1. Eligibility for a Refund</h2>
      <p>You are eligible for a full refund if all three conditions are met:</p>
      <ul>
        <li>You subscribed to a paid plan (Student, Pro, or Scholar) within the last 7 calendar days</li>
        <li>You have processed fewer than 5 documents (PDFs uploaded or research topics generated) since subscribing</li>
        <li>This is your first refund request on your account</li>
      </ul>
      <p>Refund requests that do not meet all three conditions will not be approved.</p>

      <h2>2. Non-Refundable Situations</h2>
      <p>The following are not eligible for refunds:</p>
      <ul>
        <li>Renewal charges — if your subscription auto-renewed and you did not cancel before the renewal date</li>
        <li>Requests made more than 7 days after the initial subscription charge</li>
        <li>Accounts that have processed 5 or more documents since subscribing</li>
        <li>Downgrade requests — moving to a lower plan is not a refund; it takes effect at the next billing cycle</li>
        <li>Partial month refunds — we do not prorate unused days in a billing period</li>
        <li>Free plan — there is no charge to refund</li>
      </ul>

      <h2>3. How to Request a Refund</h2>
      <p>Email <strong>support@arxio.in</strong> with the subject line <strong>&quot;Refund Request&quot;</strong> and include:</p>
      <ul>
        <li>The email address on your Arxio account</li>
        <li>The date you subscribed</li>
        <li>A brief note on why you are requesting a refund (optional but helpful)</li>
      </ul>
      <p>We will verify your eligibility and respond within 2 business days.</p>

      <h2>4. Processing Time</h2>
      <p>Once approved:</p>
      <ul>
        <li>Refunds are issued to your original payment method via Stripe</li>
        <li>Processing takes 5–10 business days depending on your bank or card issuer</li>
        <li>You will receive a confirmation email from us and a receipt from Stripe when the refund is processed</li>
      </ul>
      <p>Your account will be downgraded to the Free plan once the refund is issued.</p>

      <h2>5. Cancellations</h2>
      <p>Cancelling your subscription is different from requesting a refund. If you cancel:</p>
      <ul>
        <li>Your paid plan remains active until the end of the current billing period</li>
        <li>Your account automatically downgrades to Free at the next renewal date</li>
        <li>No charge is made for the following month</li>
        <li>You do not receive a refund for the current period (unless you also meet the refund eligibility criteria above)</li>
      </ul>
      <p>To cancel, go to <strong>Settings → Subscription → Cancel Plan</strong>.</p>

      <h2>6. Disputes</h2>
      <p>If you believe a charge was made in error, please contact us at <strong>support@arxio.in</strong> before initiating a chargeback with your bank. We will resolve legitimate billing errors promptly. Chargebacks initiated without contacting us first may result in account suspension.</p>

      <h2>7. Contact</h2>
      <p>Questions about a charge or this policy? Email <strong>support@arxio.in</strong>. We aim to respond within 2 business days.</p>
    </LegalLayout>
  );
}
