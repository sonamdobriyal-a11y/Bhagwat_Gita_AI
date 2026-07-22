"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gita_onboarding_complete_v1";

type Step = {
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

const STEPS: Step[] = [
  {
    title: "Welcome to Bhagavad Gita AI",
    body: "This site helps you explore the Gita through grounded dialogue, reflective journal pieces, and stories from the epic. Let us walk you through the main areas.",
  },
  {
    title: "Discover the approach",
    body: "The home page explains how replies stay tied to real scripture — warm, plain-spoken, and verifiable against your own copy of the text.",
    href: "/#text",
    cta: "See how it works",
  },
  {
    title: "Open the Dialogue",
    body: "Sign in and chat in your own words. Krishna-themed replies cite only passages from the corpus — ask about duty, anxiety, karma, or any Gita theme.",
    href: "/chat",
    cta: "Start chatting",
  },
  {
    title: "Read the Journal",
    body: "Campfire essays on karma yoga, meditation, dharma, and daily practice — indexed so you can skim before diving into conversation.",
    href: "/journal",
    cta: "Browse journal",
  },
  {
    title: "Explore Stories",
    body: "Voices often in the margins — queens, mothers, and warriors whose choices ripple across the Mahabharata, including links to the Gita's battlefield.",
    href: "/stories",
    cta: "View stories",
  },
];

export function OnboardingTutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  const complete = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" aria-hidden />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] border border-gita-line/60 bg-white shadow-2xl shadow-slate-900/20 dark:border-gita-line dark:bg-gita-ivory dark:shadow-black/40">
        <div className="h-1 bg-gita-line/40">
          <div
            className="h-full bg-gradient-to-r from-gita-saffron to-gita-peacock transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gita-saffron">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 id="onboarding-title" className="font-display text-xl font-semibold tracking-tight text-gita-earth sm:text-2xl">
            {current.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gita-muted">{current.body}</p>

          {current.href && current.cta && (
            <Link
              href={current.href}
              onClick={() => {
                if (isLast) complete();
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gita-peacock hover:text-gita-saffron transition-colors"
            >
              {current.cta}
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={skip}
              className="text-xs font-semibold text-gita-muted hover:text-gita-earth transition-colors"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Back
                </button>
              )}
              {isLast ? (
                <button type="button" onClick={complete} className="btn-primary px-5 py-2 text-xs">
                  Get started
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="btn-primary px-5 py-2 text-xs"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
