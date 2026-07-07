"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KrishnaAvatar, ArjunaAvatar } from "@/components/CharacterAvatars";
import { AppNav } from "@/components/AppNav";
import { MobileCarousel } from "@/components/MobileCarousel";

const VERSES = [
  { ref: "2.47", chapter: "Karma Yoga", text: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions." },
  { ref: "6.5", chapter: "Dhyāna Yoga", text: "Elevate yourself through the power of your mind, and do not degrade yourself. The mind can be your best friend or your greatest enemy." },
  { ref: "2.70", chapter: "Sāṃkhya Yoga", text: "As the ocean remains undisturbed though rivers flow into it, the sage who is not disturbed even by the flow of desires attains peace." },
];

function VerseCarousel() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const go = (i: number) => {
    if (i === active || fading) return;
    setFading(true);
    setTimeout(() => { setActive(i); setFading(false); }, 200);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((a) => (a + 1) % VERSES.length);
        setFading(false);
      }, 200);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const v = VERSES[active];

  return (
    <div className={`transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"}`}>
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-sm border border-teal-200/80">
            BG {v.ref}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{v.chapter}</span>
        </div>
        <p className="text-xs text-slate-500">Plain English · echoes the pause before the armies move</p>
      </header>
      <blockquote className="font-display text-xl md:text-[1.35rem] leading-[1.75] text-slate-800 font-normal not-italic pl-6 border-l-[3px] border-teal-500 bg-slate-50/80 py-4 pr-4 rounded-r-2xl">
        {v.text}
      </blockquote>
      <div className="mt-6 flex gap-2" role="tablist" aria-label="Select verse">
        {VERSES.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => go(i)}
            className={`rounded-sm transition-colors h-1.5 ${
              i === active ? "w-10 bg-teal-600" : "w-2 bg-slate-200 hover:bg-teal-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const tick = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1200, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export function HomePage() {
  return (
    <div className="relative min-h-screen bg-white font-sans text-slate-800">
      <AppNav />

      <div className="pointer-events-none absolute left-[6%] top-40 h-64 w-64 rounded-full bg-teal-100/40 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute right-[8%] top-96 h-56 w-56 rounded-full bg-violet-100/35 blur-3xl" aria-hidden />

      <main className="relative z-[1] mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">

        {/* Hero */}
        <section className="relative grid gap-12 border-b border-slate-200/80 pb-20 lg:grid-cols-[minmax(0,1.12fr)_minmax(260px,1fr)] lg:gap-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-200/60 sm:p-10">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-teal-100/60 to-transparent"
              aria-hidden
            />
            <p className="mb-5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-teal-700">Not another generic bot · rooted in the text</p>
            <h1 className="font-display text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              Turn the noise in your head into a{" "}
              <span className="bg-gradient-to-r from-teal-800 via-indigo-800 to-violet-800 bg-clip-text text-transparent">
                calm, honest dialogue
              </span>{" "}
              with the Gītā—not a lecture.
            </h1>
            <p className="mt-7 max-w-xl text-[1.05rem] leading-[1.75] text-slate-600">
              Ask like you would a sharp friend who actually read the book. Replies stay warm and plain-spoken, but lean on real
              śloka-sized chunks from the corpus—so you can check every reference against your own copy tonight.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/chat" className="btn-primary px-8 py-3.5 text-sm inline-flex items-center gap-2">
                Open the dialogue
              </Link>
              <a href="#text" className="btn-secondary px-8 py-3.5 text-sm">
                See how it works
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <figure className="mx-auto w-full max-w-[340px] lg:mx-0">
              <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 to-teal-50/50 shadow-lg shadow-slate-200/50 ring-1 ring-teal-100">
                <Image
                  src="/chravyuh.png"
                  alt="Chakravyūha battlefield formation diagram"
                  fill
                  className="object-contain p-3 sm:p-4"
                  sizes="(max-width: 1024px) 90vw, 340px"
                  priority
                />
              </div>
              <figcaption className="mt-4 text-center font-display text-xs italic leading-relaxed text-gita-muted lg:text-left">
                Chakravyūha — spirals of doubt that still resolve into one clear line of action.
              </figcaption>
            </figure>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50/50 p-6">
              <div className="mx-auto mb-6 flex max-w-[240px] flex-col items-center gap-4 lg:mx-0 lg:flex-row lg:justify-start">
                <KrishnaAvatar size="md" />
                <span className="text-sm text-slate-700">
                  <span className="font-devanagari font-semibold">कृष्ण</span>
                  <span className="font-display font-semibold tracking-wide"> · Kṛṣṇa</span>
                </span>
                <hr className="manuscript-rule hidden w-12 opacity-70 lg:block" />
                <ArjunaAvatar size="md" />
                <span className="text-sm text-slate-700">
                  <span className="font-devanagari font-semibold">अर्जुन</span>
                  <span className="font-display font-semibold tracking-wide"> · Arjuna</span>
                </span>
              </div>
              <p className="text-center font-display text-sm leading-relaxed text-gita-muted italic lg:text-left">
                Two voices on a tense morning — your questions ride with Arjuna; grounded answers echo with Kṛṣṇa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-12 border-t border-slate-200/80 pt-12 sm:gap-16 lg:col-span-2">
            {[
              { n: 700, s: "+", l: "Ślokās (approx.)", c: "text-teal-700" },
              { n: 18, s: "", l: "Adhyāyās", c: "text-indigo-700" },
              { n: 5000, s: "+", l: "Years of transmission", c: "text-rose-700" },
            ].map(({ n, s, l, c }) => (
              <div key={l} className="text-center">
                <p className={`font-display text-3xl tabular-nums font-semibold ${c}`}>
                  <AnimatedCounter to={n} suffix={s} />
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gita-muted">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sample dialogue */}
        <section id="dialogue" className="relative border-b border-slate-200/80 py-20">
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-indigo-700">The two camps in one frame</p>
            <h2 className="font-display text-[1.75rem] font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              Conversational flanks — Arjuna and Kṛṣṇa
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gita-muted">
              Your prompts ride with Arjuna&rsquo;s side of the reins; replies echo from Kṛṣṇa&rsquo;s counsel—exactly where the churn of doubt meets the vow to speak plainly on the battlefield of the mind.
            </p>
          </div>
          <div className="mx-auto max-w-xl rounded-[1.75rem] border border-slate-200/80 bg-white p-7 shadow-md shadow-slate-200/50 sm:p-8">
            <div className="mb-6 flex justify-end gap-3">
              <div className="max-w-[86%] text-right">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-rose-700">Arjuna</p>
                <div className="inline-block rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white px-4 py-3 text-left text-[15px] leading-relaxed text-slate-800 shadow-sm">
                  How ought one to engage in action without obsessive attachment to outcomes?
                </div>
              </div>
              <ArjunaAvatar />
            </div>
            <div className="flex justify-start gap-3">
              <KrishnaAvatar />
              <div className="max-w-[86%]">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-teal-700">Kṛṣṇa</p>
                <div className="rounded-2xl border border-slate-100 border-l-[3px] border-l-teal-500 bg-slate-50/90 px-4 py-3 text-[15px] leading-relaxed text-slate-800 shadow-sm">
                  The reply cites only passages present in our corpus—for example doctrines associated with karma-yoga (<span className="font-mono text-sm text-teal-700">BG 2.47</span>).
                  Short, spoken answers—yet verse tags point back to śloka you can verify at home tonight.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="text" className="scroll-mt-28 py-20">
          <MobileCarousel
            ariaLabel="How the dialogue works"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            slideClassName="w-[85vw] max-w-[300px] flex-shrink-0 snap-center"
          >
          {[
            {
              title: "Grounded replies",
              body: "Answers pull toward real embedded śloka text so verse numbers are less likely to drift into fantasy—we keep the tether short, like reins on restless horses.",
            },
            {
              title: "Steadied tone",
              body: "No sermon thunder: calm, conversational voice that lets you disagree, circle back, and ask again—as on the noisy plain where clarity had to compete with clamour.",
            },
            {
              title: "Thread memory",
              body: "A little history travels with each turn so the exchange feels continuous, like staying beside the same chariot wheel.",
            },
            {
              title: "You lead",
              body: "You steer the sankā—the difficulty. The assistant widens angles only within material it can cite from the corpus you trust.",
            },
          ].map((f, i) => {
            const accents = [
              "border-teal-200/80 bg-gradient-to-br from-white to-teal-50/70",
              "border-violet-200/80 bg-gradient-to-br from-white to-violet-50/70",
              "border-rose-200/80 bg-gradient-to-br from-white to-rose-50/70",
              "border-sky-200/80 bg-gradient-to-br from-white to-sky-50/70",
            ];
            const titles = ["text-teal-800", "text-violet-800", "text-rose-800", "text-sky-800"];
            return (
            <article
              key={f.title}
              className={`rounded-[1.35rem] border p-6 shadow-sm transition hover:shadow-md ${accents[i]}`}
            >
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-slate-400">Fold {String(i + 1).padStart(2, "0")}</span>
              <h3 className={`mt-3 font-display text-lg font-semibold tracking-tight ${titles[i]}`}>{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{f.body}</p>
            </article>
            );
          })}
          </MobileCarousel>
        </section>

        {/* Verse block */}
        <section className="relative border-t border-slate-200/80 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            <VerseCarousel />
            <aside className="h-fit rounded-[1.75rem] border border-indigo-100/80 bg-indigo-50/40 p-7 lg:sticky lg:top-28">
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-indigo-700">Dust-margin note</p>
              <p className="font-display text-sm leading-relaxed text-gita-muted italic">
                Transliteration favours readability in English; wherever you drill deeper, reconcile diacritics with the printed copy on your altar or desk—not with argument alone.
              </p>
            </aside>
          </div>
        </section>

        {/* Procedure */}
        <section className="relative border-t border-slate-200/80 py-16">
          <h2 className="mb-12 font-display text-[1.75rem] font-semibold tracking-tight text-slate-900">
            Turning scripture toward the moment
          </h2>
          <MobileCarousel
            ariaLabel="How to use the dialogue"
            className="grid gap-8 sm:grid-cols-3"
            slideClassName="w-[85vw] max-w-[320px] flex-shrink-0 snap-center"
          >
          {[
              { step: "I", title: "Speak the bind aloud", detail: "Name dread, duty, resentment, tenderness—anything that pins you mid-field like Partha staring at elders.", c: "text-teal-700" },
              { step: "II", title: "The array tightens around text", detail: "Retrieval hunts the corpus for chunks that rhyme with what you revealed; unseen vyūhus become visible lines.", c: "text-indigo-700" },
              { step: "III", title: "Answer that walks with you", detail: "A spoken reply draws those lines together—with handles (verse refs or IDs) you can tug on later in quiet.", c: "text-violet-700" },
            ].map(({ step, title, detail, c }) => (
              <li key={step} className="rounded-2xl border border-slate-200/80 bg-white p-5 list-none">
                <span className={`font-mono text-xs font-semibold ${c}`}>{step}</span>
                <h3 className="mt-2 font-display text-[1.0625rem] font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gita-muted">{detail}</p>
              </li>
            ))}
          </MobileCarousel>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-700/20 bg-gradient-to-br from-slate-800 via-teal-900 to-indigo-950 px-8 py-16 text-center text-white shadow-xl shadow-slate-900/15 sm:px-12">
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" aria-hidden />
          <div className="relative">
            <p className="font-display text-[10px] uppercase tracking-[0.28em] text-white/85 mb-4">Hold the reins</p>
            <h2 className="font-display text-2xl font-semibold sm:text-4xl mb-4 tracking-tight">
              Still on the brink? Step into conversation.
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-[15px] leading-relaxed text-slate-200">
              Vyūhas may swirl, but the pact endures — you ask; the text answers in a voice tempered for mortal ears. Keep your own copy near; humility before the battlefield is wisdom.
            </p>
            <Link
              href="/chat"
              className="inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-bold text-teal-900 shadow-lg shadow-black/10 transition hover:bg-teal-50"
            >
              Open chat on the plain
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-10 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="font-display text-sm font-semibold text-slate-800">Bhagavad Gītā AI</p>
          <p className="text-center text-[12px] text-slate-500">
            © {new Date().getFullYear()} Bhagavad Gītā AI
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-[13px] text-slate-600">
            <Link href="/chat" className="transition hover:text-teal-700">Dialogue</Link>
            <Link href="/journal" className="transition hover:text-indigo-700">Journal</Link>
            <Link href="/stories" className="transition hover:text-violet-700">Stories</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
