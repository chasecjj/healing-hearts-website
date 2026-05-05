import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { TeardropImage, OrganicDivider, Card, CardContent, Button } from '@scoria/ui';
import { Mail, Phone } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  /meet/trisha — Personal networking page for Orlando workshop       */
/*  Conversion intensity: 3/10 (networking, not funnel)               */
/*  Mobile-portrait-first — QR-scanned on venue floor                 */
/* ------------------------------------------------------------------ */

export default function MeetTrisha() {
  usePageMeta(
    'Meet Trisha Jamison',
    'Trisha Jamison is a coach with over 20 years of experience in polyvagal theory and nervous system regulation. Co-founder of Healing Hearts.'
  );

  return (
    <div className="w-full min-h-screen bg-neutral-50 text-foreground">

      {/* ── Section 1: Hero ───────────────────────────────────────── */}
      <section
        aria-labelledby="trisha-hero-headline"
        className="w-full px-6 py-12 sm:px-10 sm:py-20 bg-neutral-50"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
          {/* Photo — stacks above text on mobile, right on desktop */}
          <div className="order-first sm:order-last flex-shrink-0 flex justify-center sm:justify-end">
            <TeardropImage
              src="/images/team/trisha.jpg"
              alt="Trisha Jamison, coach and co-founder of Healing Hearts"
              className="w-52 sm:w-64"
              overlayClass="bg-primary/10"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-3 sm:flex-1">
            <p className="font-sans text-primary/60 tracking-widest uppercase text-xs">
              Healing Hearts
            </p>
            <h1
              id="trisha-hero-headline"
              className="font-accent italic text-5xl sm:text-6xl text-primary leading-tight"
            >
              Trisha
            </h1>
            <p className="font-sans text-foreground/70 text-base sm:text-lg leading-relaxed font-light">
              Coach. Architect of HEALED frameworks. Wife to Jeff for 38+ years.
            </p>
          </div>
        </div>
      </section>

      {/* ── Wave divider ─────────────────────────────────────────── */}
      <OrganicDivider variant="wave-1" />

      {/* ── Section 2: Short story ───────────────────────────────── */}
      <section
        aria-label="About Trisha"
        className="w-full px-6 py-12 sm:px-10 sm:py-16 bg-background"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-accent italic text-2xl sm:text-3xl text-primary mb-6">
            A little about me
          </h2>
          <p className="font-sans text-foreground/80 text-base sm:text-lg leading-relaxed font-light mb-6">
            I'm a coach with over 20 years of experience and deep training in polyvagal theory and
            nervous system regulation. Jeff and I have been married more than 38 years and raised
            six children together.
          </p>
          <p className="font-sans text-foreground/80 text-base sm:text-lg leading-relaxed font-light">
            For many of those years, we looked fine on the outside and felt invisible on the inside.
            We didn't just survive that — we chose to understand it. The frameworks I teach today
            come from the work we did to find our way back to each other.
          </p>
        </div>
      </section>

      {/* ── Section 3: What I help with ──────────────────────────── */}
      <section
        aria-label="What Trisha helps with"
        className="w-full px-6 py-12 sm:px-10 sm:py-16 bg-neutral-50"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-accent italic text-2xl sm:text-3xl text-primary mb-6">
            What I help with
          </h2>
          <div className="flex flex-col gap-4">
            <Card className="border border-primary/10 bg-white rounded-2xl">
              <CardContent className="p-6">
                <p className="font-sans text-foreground/80 text-base leading-relaxed font-light">
                  Translating nervous-system science into language couples can actually use at 11pm
                  on a Wednesday.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-primary/10 bg-white rounded-2xl">
              <CardContent className="p-6">
                <p className="font-sans text-foreground/80 text-base leading-relaxed font-light">
                  Coaching long-married couples out of quiet disconnection.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-primary/10 bg-white rounded-2xl">
              <CardContent className="p-6">
                <p className="font-sans text-foreground/80 text-base leading-relaxed font-light">
                  Building frameworks that hold under pressure — not just inspire.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Section 4: Connect block ──────────────────────────────── */}
      <section
        aria-label="Connect with Trisha"
        className="w-full px-6 py-12 sm:px-10 sm:py-16 bg-background"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-accent italic text-2xl sm:text-3xl text-primary mb-6">
            Let's stay in touch
          </h2>
          <Card className="border border-primary/10 bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col gap-4">
              <a
                href="mailto:trishajamison@healingheartscourse.com"
                className="flex items-center gap-3 text-primary hover:text-primary/70 transition-colors min-h-[48px]"
                aria-label="Email Trisha"
              >
                <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="font-sans text-base">
                  trishajamison@healingheartscourse.com
                </span>
              </a>
              <a
                href="tel:+18016868466"
                className="flex items-center gap-3 text-primary hover:text-primary/70 transition-colors min-h-[48px]"
                aria-label="Call Trisha — Mobile"
              >
                <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="font-sans text-base">
                  +1 801-686-8466 <span className="text-foreground/50 text-sm">(Mobile)</span>
                </span>
              </a>
              {/* LinkedIn placeholder — uncomment when URL confirmed
              <a
                href="https://linkedin.com/in/PLACEHOLDER"
                className="flex items-center gap-3 text-primary hover:text-primary/70 transition-colors min-h-[48px]"
                aria-label="Trisha on LinkedIn"
              >
                <span className="font-sans text-base">LinkedIn</span>
              </a>
              */}
              {/* Instagram placeholder — uncomment when handle confirmed
              <a
                href="https://instagram.com/PLACEHOLDER"
                className="flex items-center gap-3 text-primary hover:text-primary/70 transition-colors min-h-[48px]"
                aria-label="Trisha on Instagram"
              >
                <span className="font-sans text-base">Instagram</span>
              </a>
              */}
              <div className="pt-2">
                <Link to="/journey">
                  <Button
                    className="w-full sm:w-auto min-h-[48px] bg-primary-500 text-white hover:bg-primary-600"
                    aria-label="Visit Healing Hearts website"
                  >
                    Visit healingheartscourse.com
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Section 5: Footer ─────────────────────────────────────── */}
      <footer className="w-full px-6 py-8 bg-neutral-50 text-center">
        <p className="font-sans text-foreground/50 text-sm">
          <Link to="/" className="hover:text-primary transition-colors">
            healingheartscourse.com
          </Link>{' '}
          &copy; Healing Hearts
        </p>
      </footer>

    </div>
  );
}
