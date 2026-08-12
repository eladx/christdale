export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Legal
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Terms of Service
      </h1>
      <p className="mt-4 font-mono text-xs text-muted">
        Last updated: {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <p>
          These Terms of Service ("Terms") govern your use of Christdale's
          website and services. By creating an account or placing an order,
          you agree to these Terms.
        </p>

        <section>
          <h2 className="font-display text-xl text-ink">1. Eligibility</h2>
          <p className="mt-3">
            You must be at least 18 years old, or have a parent/guardian's
            permission, to create an account and make purchases on
            Christdale.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">2. Accounts</h2>
          <p className="mt-3">
            You're responsible for keeping your account credentials secure
            and for all activity under your account. Notify us immediately
            if you suspect unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">3. Products &amp; Pricing</h2>
          <p className="mt-3">
            We make reasonable efforts to display accurate product
            information, images, and pricing. Prices are listed in Philippine
            Peso (₱) and may change without notice. In the event of a pricing
            error, we reserve the right to cancel and refund the affected
            order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">4. Orders &amp; Payment</h2>
          <p className="mt-3">
            Orders are confirmed once payment is successfully processed
            through our payment partner, PayMongo. We accept GCash, Maya, and
            other supported payment methods. We reserve the right to cancel
            any order for reasons including but not limited to product
            unavailability, pricing errors, or suspected fraud.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">5. Shipping</h2>
          <p className="mt-3">
            Shipping times and costs will be communicated at checkout or via
            order confirmation. Christdale is not responsible for delays
            caused by couriers or circumstances outside our control.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">6. Returns &amp; Refunds</h2>
          <p className="mt-3">
            If you receive a defective or incorrect item, contact us within 7
            days of delivery. Approved returns/refunds will be processed
            back to your original payment method. Products must be unused and
            in original packaging unless defective.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">7. Coaching Services</h2>
          <p className="mt-3">
            Coaching and training guidance provided through Christdale is for
            general fitness purposes only and does not constitute medical
            advice. Consult a physician before beginning any new exercise
            program, especially if you have a pre-existing health condition.
            You participate in any training program at your own risk.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">8. Prohibited Conduct</h2>
          <p className="mt-3">You agree not to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Use the site for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to accounts or systems</li>
            <li>Submit false or fraudulent orders</li>
            <li>Interfere with the normal operation of the website</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">9. Intellectual Property</h2>
          <p className="mt-3">
            All content on Christdale — including text, images, logos, and
            branding — is owned by Christdale or its licensors and may not be
            used without permission.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">10. Limitation of Liability</h2>
          <p className="mt-3">
            Christdale is provided "as is." To the fullest extent permitted
            by law, we are not liable for indirect, incidental, or
            consequential damages arising from your use of the site or
            products purchased through it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">11. Changes to These Terms</h2>
          <p className="mt-3">
            We may update these Terms from time to time. Continued use of
            Christdale after changes are posted constitutes acceptance of the
            revised Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">12. Governing Law</h2>
          <p className="mt-3">
            These Terms are governed by the laws of the Republic of the
            Philippines.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">13. Contact Us</h2>
          <p className="mt-3">
            Questions about these Terms? Reach us through the{" "}
            <a href="/contact" className="text-accent hover:underline">
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
