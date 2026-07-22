import Link from "next/link";
import { AppNav } from "@/components/AppNav";

const QUESTIONS = [
  "How do we act when outcomes are uncertain?",
  "How do we balance responsibility with personal desires?",
  "How do we remain steady in the face of failure, success, fear, or doubt?",
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gita-field-warm font-sans text-gita-earth">
      <AppNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-gita-line/60 bg-gradient-to-b from-gita-ivory to-gita-field-warm px-5 py-20 text-center sm:py-28">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gita-saffron/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-0 h-60 w-60 rounded-full bg-gita-peacock/8 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-gita-saffron">
            Bhagavad Gita AI · About
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-gita-earth sm:text-5xl">
            Ancient Wisdom for{" "}
            <span className="text-gita-peacock">Modern Decisions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gita-muted sm:text-lg">
            Every day, we face decisions that shape our lives — from small choices to ones
            that echo for years. Clarity is harder to find than ever, even as information
            floods every screen. This platform was built to help bridge that gap.
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-3xl space-y-16 px-5 py-16 sm:px-8">

        {/* Platform mission */}
        <section className="space-y-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gita-saffron">Our Purpose</p>
          <p className="text-base leading-relaxed text-gita-earth/90">
            Academic pressure, career uncertainty, relationship conflicts, self-doubt, and ethical
            dilemmas have become an increasingly common part of modern life — especially for
            students and young adults. <strong className="font-semibold text-gita-earth">Bhagavad Gita AI</strong> was
            created to help navigate these moments with depth and calm.
          </p>
          <p className="text-base leading-relaxed text-gita-earth/90">
            Inspired by the Bhagavad Gita, this platform transforms complex philosophical concepts
            into practical, conversational guidance. Rather than overwhelming users with lengthy
            verses or difficult interpretations, it engages in meaningful dialogue — helping
            people explore situations, reflect on their choices, and gain perspective.
          </p>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-gita-line" />

        {/* Why the Gita */}
        <section className="space-y-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gita-saffron">Why the Bhagavad Gita</p>
          <p className="text-base leading-relaxed text-gita-earth/90">
            The Gita is often viewed as a religious text. While it holds immense spiritual
            significance, it is also a profound exploration of human nature — responsibility,
            resilience, self-awareness, and decision-making. Its teachings have resonated for
            thousands of years because the questions it addresses remain fundamentally human.
          </p>

          {/* Pull-quote questions */}
          <div className="space-y-3 border-l-[3px] border-gita-saffron/60 pl-5">
            {QUESTIONS.map((q) => (
              <p key={q} className="font-display text-[15px] italic leading-snug text-gita-peacock">
                {q}
              </p>
            ))}
          </div>

          <p className="text-base leading-relaxed text-gita-earth/90">
            These questions are just as relevant today as they were centuries ago. Yet many
            find the text difficult to approach — traditional language, philosophical depth,
            and varying interpretations can make its teachings feel distant. This platform
            translates those ideas into clear, relatable, and actionable insights, without
            preaching or providing definitive answers. It supports thoughtful reflection.
          </p>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-gita-line" />

        {/* Creator */}
        <section className="space-y-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gita-saffron">About the Creator</p>

          <div className="flex items-start gap-4 rounded-2xl border border-gita-line/80 bg-gita-chariot/70 px-6 py-5 shadow-sm">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gita-saffron-soft to-gita-saffron text-lg font-bold text-white shadow">
              M
            </div>
            <div>
              <p className="font-semibold text-gita-earth">Meenal Chopra</p>
              <p className="text-sm text-gita-muted">Grade 12</p>
            </div>
          </div>

          <p className="text-base leading-relaxed text-gita-earth/90">
            The idea for Bhagavad Gita AI emerged from a simple observation: many young people
            are searching for guidance, yet the resources available often feel either superficial
            or disconnected from their actual circumstances. At the same time, some of the
            world&apos;s most enduring wisdom remains inaccessible — perceived as complex,
            intimidating, or outdated.
          </p>
          <p className="text-base leading-relaxed text-gita-earth/90">
            Exploring the Gita revealed something striking: beneath its philosophical language
            were insights into uncertainty, discipline, purpose, emotional resilience, and ethical
            decision-making — the exact challenges students face every day. This project began
            with a single question:
          </p>

          <blockquote className="rounded-xl border border-gita-line/60 bg-gita-field-deep/60 px-6 py-5">
            <p className="font-display text-lg italic leading-snug text-gita-peacock">
              &ldquo;What if technology could help make timeless wisdom more accessible?&rdquo;
            </p>
          </blockquote>

          <p className="text-base leading-relaxed text-gita-earth/90">
            Bhagavad Gita AI represents an interest in building technology that goes beyond
            efficiency and convenience — technology that also fosters reflection, understanding,
            and personal growth.
          </p>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-gita-line" />

        {/* Vision */}
        <section className="space-y-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gita-saffron">Our Vision</p>
          <p className="text-base leading-relaxed text-gita-earth/90">
            We envision a future where technology does more than answer questions — a future
            where it helps people think more deeply, make more thoughtful decisions, and engage
            with ideas that have guided human understanding for generations.
          </p>
          <p className="text-base font-medium leading-relaxed text-gita-earth">
            Bhagavad Gita AI is one small step toward that future.
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-gita-line/60 bg-gradient-to-br from-gita-ivory to-gita-field-deep px-8 py-10 text-center shadow-sm">
          <p className="font-display text-[10px] uppercase tracking-[0.25em] text-gita-saffron">Begin the Dialogue</p>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-gita-earth">
            Bring your question. The Gita will meet it.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gita-muted">
            Chat in plain language. Every reply cites only passages the app can retrieve —
            scripture aimed at what actually troubles you.
          </p>
          <Link
            href="/chat"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gita-saffron-soft to-gita-saffron px-7 py-3 text-sm font-semibold text-white shadow-md shadow-gita-saffron/20 transition hover:brightness-105"
          >
            Start a conversation
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gita-line/60 px-5 py-8 text-center font-sans text-[12px] text-gita-muted">
        <p>© {new Date().getFullYear()} Bhagavad Gita AI · Built with purpose.</p>
      </footer>
    </div>
  );
}
