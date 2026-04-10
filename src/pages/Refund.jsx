import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

export default function Refund() {
  usePageMeta('Refund Policy', 'Healing Hearts refund policy: satisfaction guarantees, cooling-off period, and how to request a refund.');

  return (
    <div className="w-full bg-background pt-32 md:pt-48 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <p className="font-sans text-primary/60 tracking-widest uppercase text-sm mb-6 text-center">Legal</p>
        <h1 className="font-drama italic text-5xl md:text-7xl text-primary leading-tight mb-8 text-center">
          Refund Policy
        </h1>
        <p className="font-sans text-foreground/60 text-center mb-16">
          Effective Date: April 10, 2026 &middot; Last updated: April 10, 2026
        </p>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-xl border border-primary/5 space-y-8 font-sans text-foreground/80 font-light leading-relaxed">

          {/* Intro */}
          <section>
            <p className="text-lg">
              We want you to feel confident in your purchase. Healing Hearts Consulting, LLC offers the following refund and satisfaction terms for all purchases made through healingheartscourse.com.
            </p>
            <p>
              If at any point during your journey you have questions or concerns about your purchase, please reach out to us at{' '}
              <a href="mailto:refunds@healingheartscourse.com" className="text-primary underline hover:text-primary/80">
                refunds@healingheartscourse.com
              </a>{' '}
              before requesting a chargeback. We are here to help and will do everything we can to make things right.
            </p>
          </section>

          {/* Digital Products */}
          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">1. Digital Products (Conflict Rescue Kit, Card Pack, and similar)</h2>
            <div className="space-y-4">
              <p>
                <strong>7-Day Satisfaction Guarantee.</strong> If within seven (7) days of purchase you feel our digital resource is not a good fit for your relationship, we will issue a full refund &mdash; no questions asked.
              </p>
              <p>
                To request a refund on a digital product, email{' '}
                <a href="mailto:refunds@healingheartscourse.com" className="text-primary underline hover:text-primary/80">
                  refunds@healingheartscourse.com
                </a>{' '}
                with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The email address you used at checkout</li>
                <li>The date of your purchase</li>
                <li>The name of the product</li>
              </ul>
              <p>
                Refunds are processed within 5&ndash;7 business days and appear back on the original payment method.
              </p>
            </div>
          </section>

          {/* Full Course */}
          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">2. The Full Healing Hearts Program</h2>
            <div className="space-y-4">
              <p>
                <strong>14-Day Satisfaction Guarantee.</strong> If within fourteen (14) days of enrollment you complete Module 1 and decide the program is not right for you, we will issue a full refund of your Pay-in-Full payment upon written request.
              </p>
              <p>
                <strong>After 14 days (Pay-in-Full):</strong> Per Section 3.3 of our <Link to="/terms" className="text-primary underline hover:text-primary/80">Terms &amp; Conditions</Link>, in the event of voluntary early termination after the 14-day window, Healing Hearts Consulting, LLC may, at its sole discretion, issue a partial refund up to a maximum of Five Thousand Dollars ($5,000).
              </p>
              <p>
                <strong>Installment Plans:</strong> The first installment payment is refundable within 14 days if the Client completes Module 1 and requests a refund. After 14 days, subsequent installment payments are non-refundable and the Client remains financially responsible for the remainder of the selected payment plan, as outlined in our Terms.
              </p>
              <p>
                To request a refund on the Full Program, email{' '}
                <a href="mailto:refunds@healingheartscourse.com" className="text-primary underline hover:text-primary/80">
                  refunds@healingheartscourse.com
                </a>{' '}
                within your eligible window. A member of our team will respond within 2 business days to guide you through the process.
              </p>
            </div>
          </section>

          {/* In-person sales */}
          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">3. In-Person Sales (Events, Expos, Workshops)</h2>
            <div className="space-y-4">
              <p>
                <strong>Federal Cooling-Off Rule.</strong> In accordance with the Federal Trade Commission Cooling-Off Rule (16 CFR &sect;429), purchases made at temporary booths, expos, or off-site events may be cancelled without penalty by sending written notice of cancellation within three (3) business days of the sale.
              </p>
              <p>
                To cancel an in-person purchase under the Cooling-Off Rule, send written notice (email is acceptable) to{' '}
                <a href="mailto:refunds@healingheartscourse.com" className="text-primary underline hover:text-primary/80">
                  refunds@healingheartscourse.com
                </a>{' '}
                within three business days of your purchase. Include your name, the date and location of the sale, and a statement of cancellation.
              </p>
              <p>
                Refunds for in-person purchases are processed within 10 business days of receiving your cancellation notice.
              </p>
            </div>
          </section>

          {/* How refunds are processed */}
          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">4. How Refunds Are Processed</h2>
            <div className="space-y-4">
              <p>
                All refunds are issued to the original payment method used at checkout. Depending on your bank or card issuer, refunds may take 5&ndash;10 business days to appear on your statement after we process them.
              </p>
              <p>
                Refunds on promotional or discounted purchases are issued at the actual amount paid, not the full retail value.
              </p>
              <p>
                We do not charge a restocking fee or administrative fee on any refund.
              </p>
            </div>
          </section>

          {/* Before chargeback */}
          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">5. Please Contact Us Before Requesting a Chargeback</h2>
            <div className="space-y-4">
              <p>
                If you have any concern about a charge from Healing Hearts, please email us at{' '}
                <a href="mailto:refunds@healingheartscourse.com" className="text-primary underline hover:text-primary/80">
                  refunds@healingheartscourse.com
                </a>{' '}
                before contacting your bank to dispute the charge. In almost every case we can resolve the issue directly &mdash; often within hours &mdash; and chargebacks carry fees for both of us that neither of us wants to deal with.
              </p>
              <p>
                We are real people on the other side of these emails. We will respond with care.
              </p>
            </div>
          </section>

          {/* Questions */}
          <section>
            <h2 className="font-outfit font-bold text-2xl text-primary mb-4">6. Questions</h2>
            <p>
              If you have any questions about this Refund Policy, email us at{' '}
              <a href="mailto:hello@healingheartscourse.com" className="text-primary underline hover:text-primary/80">
                hello@healingheartscourse.com
              </a>{' '}
              or visit our <Link to="/contact" className="text-primary underline hover:text-primary/80">contact page</Link>.
            </p>
            <p className="mt-6 text-sm text-foreground/60">
              Healing Hearts Consulting, LLC &middot; 2889 W Chestnut St, Lehi, UT 84043 &middot; USA
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
