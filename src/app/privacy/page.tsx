export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Legal
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-4 font-mono text-xs text-muted">
        Last updated: {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <p>
          Christdale ("we," "our," "us") respects your privacy. This policy
          explains what personal data we collect, why we collect it, and how
          we handle it, in line with the Philippines' Data Privacy Act of
          2012 (RA 10173).
        </p>

        <section>
          <h2 className="font-display text-xl text-ink">1. Information We Collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Account information:</strong> full
              name, email address, and password (stored securely by our
              authentication provider, Supabase, and never visible to us in
              plain text).
            </li>
            <li>
              <strong className="text-ink">Profile information:</strong>{" "}
              shipping address, phone number, and profile photo, if you choose
              to provide them.
            </li>
            <li>
              <strong className="text-ink">Order information:</strong>{" "}
              products purchased, quantities, prices, and shipping details for
              each order.
            </li>
            <li>
              <strong className="text-ink">Payment information:</strong> we do
              not store your card, GCash, or Maya details. Payments are
              processed directly by PayMongo, a PCI-compliant payment
              processor. We only receive confirmation that a payment
              succeeded or failed.
            </li>
            <li>
              <strong className="text-ink">Phone verification:</strong> if you
              verify your phone number, a one-time code is sent via our SMS
              provider and a record of the verification is kept.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">2. How We Use Your Information</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>To create and manage your account</li>
            <li>To process and fulfill your orders, including shipping</li>
            <li>To communicate with you about your orders or account</li>
            <li>To provide customer support</li>
            <li>To improve our products, services, and website</li>
          </ul>
          <p className="mt-3">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">3. Who We Share Data With</h2>
          <p className="mt-3">
            We share data only with service providers who help us run
            Christdale, each bound to their own privacy and security
            standards:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Supabase</strong> — hosts our
              database and handles authentication.
            </li>
            <li>
              <strong className="text-ink">PayMongo</strong> — processes
              payments.
            </li>
            <li>
              <strong className="text-ink">Our SMS provider</strong> — sends
              phone verification codes.
            </li>
          </ul>
          <p className="mt-3">
            We may also disclose information if required by law or to protect
            our legal rights.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">4. Data Retention</h2>
          <p className="mt-3">
            We keep your account and order data for as long as your account
            is active, or as needed to comply with legal, accounting, or
            reporting obligations. You can request deletion of your account
            at any time (see Section 6).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">5. Security</h2>
          <p className="mt-3">
            We use industry-standard safeguards, including encrypted
            connections (HTTPS) and secure password storage, to protect your
            information. No online system is 100% secure, but we work to
            keep your data protected.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">6. Your Rights</h2>
          <p className="mt-3">
            Under the Data Privacy Act, you have the right to access,
            correct, and request deletion of your personal data. You can
            update most information yourself in{" "}
            <a href="/settings" className="text-accent hover:underline">
              Settings
            </a>
            . To request full account deletion, contact us using the details
            below.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">7. Cookies</h2>
          <p className="mt-3">
            We use minimal cookies and browser storage necessary to keep you
            logged in and remember your session. We do not use third-party
            advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">8. Children's Privacy</h2>
          <p className="mt-3">
            Christdale is not directed at children under 18. We do not
            knowingly collect personal information from minors.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">9. Changes to This Policy</h2>
          <p className="mt-3">
            We may update this policy from time to time. Material changes
            will be reflected by updating the "Last updated" date above.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">10. Contact Us</h2>
          <p className="mt-3">
            Questions about this policy or your data? Reach us through the{" "}
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
