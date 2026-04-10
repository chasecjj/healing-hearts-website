import React from 'react';
import usePageMeta from '../hooks/usePageMeta';

export default function Privacy() {
  usePageMeta('Privacy Policy', 'How Healing Hearts collects, uses, and protects your personal information.');
  return (
    <div className="w-full bg-background pt-32 md:pt-48 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <p className="font-sans text-primary/60 tracking-widest uppercase text-sm mb-6 text-center">Legal</p>
        <h1 className="font-drama italic text-5xl md:text-7xl text-primary leading-tight mb-8 text-center">
          Privacy Policy
        </h1>
        <p className="font-sans text-foreground/60 text-center mb-16">Effective Date: November 5, 2025 &middot; Last updated: April 10, 2026</p>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-xl border border-primary/5 space-y-8 font-sans text-foreground/80 font-light leading-relaxed">

          <p>
            Healing Hearts Consulting, LLC ("Healing Hearts," "we," "us," or "our") is committed to protecting the privacy of our clients and website visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or enroll in our programs.
          </p>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">1. Information We Collect</h2>
            <div className="space-y-4">
              <p><strong>Personal Information:</strong> When you contact us, enroll in a program, or create an account, we may collect your name, email address, phone number, mailing address, and payment information.</p>
              <p><strong>Coaching Session Information:</strong> Information shared during coaching sessions is treated as confidential in accordance with our Service Agreement (see Section 4.1 of our Terms & Conditions).</p>
              <p><strong>Usage Data:</strong> We may automatically collect information about your device and how you interact with our website, including IP address, browser type, pages visited, and time spent on pages.</p>
              <p><strong>Cookies:</strong> We use cookies and similar tracking technologies to improve your experience on our site. You can control cookie preferences through your browser settings.</p>
            </div>
          </section>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain our coaching programs and services</li>
              <li>To process your enrollment and payment transactions</li>
              <li>To communicate with you about your program, sessions, and account</li>
              <li>To send you updates, resources, and materials related to your enrollment</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To improve our website, programs, and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">3. How We Share Your Information</h2>
            <div className="space-y-4">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website, processing payments, or delivering our services (e.g., payment processors, email providers, video hosting platforms).</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law, or in response to valid requests by public authorities.</li>
                <li><strong>Safety:</strong> We may disclose information when we believe it is necessary to prevent imminent harm to the Client or others, as outlined in our Service Agreement.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy any legal, accounting, or reporting requirements. Coaching session records are retained for the duration of the Program Lifetime as defined in our Terms & Conditions.
            </p>
          </section>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">6. Your Rights</h2>
            <div className="space-y-4">
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> Request that we correct any inaccurate or incomplete personal information.</li>
                <li><strong>Deletion:</strong> Request that we delete your personal information, subject to certain exceptions.</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time by clicking the unsubscribe link in our emails.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at <a href="mailto:hello@healingheartscourse.com" className="text-accent hover:text-primary underline underline-offset-4 transition-colors">hello@healingheartscourse.com</a>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">7. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a minor, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our website or services after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-6 bg-[#F7F6F2] rounded-2xl">
              <p className="font-outfit font-bold text-primary">Healing Hearts Consulting, LLC</p>
              <p>Email: <a href="mailto:hello@healingheartscourse.com" className="text-accent hover:text-primary underline underline-offset-4 transition-colors">hello@healingheartscourse.com</a></p>
              <p>Governing Law: State of Utah, USA</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
