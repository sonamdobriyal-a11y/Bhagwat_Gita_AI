"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchSources, streamChat, type SourceRef, type ChatHistoryMessage } from "@/lib/api";
import { KrishnaAvatar, ArjunaAvatar } from "@/components/CharacterAvatars";

type Msg = { role: "user" | "assistant"; content: string; lang?: "en" | "hi" };

const SUGGESTIONS = [
  "How does BG distinguish between karma and karma-phala—especially for modern vocation?",
  "What resources does the text offer for anxiety before difficult decisions?",
  "I'm struggling with resentment toward someone who harmed me—how might the dialogue frame this ethically?",
  "Can you summarise the gist of karma-yoga in a way suitable for undergraduates?",
];

const DAILY_VERSES = [
  { ref: "BG 3.8", text: "Perform your obligatory duty; action exceeds inaction." },
  { ref: "BG 2.47", text: "You have entitlement to deeds alone, never to fruits thereof." },
  { ref: "BG 6.5", text: "Lift the self through the mind; degrade it not—for the mind alone is one's relative and one's adversary alike." },
];

const SendIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const CopyIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const BookIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);
const MicIcon = ({ active }: { active?: boolean }) => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3" />
    {active ? <circle cx="12" cy="12" r="9" className="animate-pulse opacity-30" /> : null}
  </svg>
);

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gita-peacock-soft/55"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  );
}

function renderContent(text: string): React.ReactNode {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    if (i > 0) result.push(<br key={`br-${i}`} />);
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    result.push(
      <span key={i}>
        {parts.map((part, pi) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={pi} className="font-semibold text-gita-earth">{part.slice(2, -2)}</strong>
            : part)}
      </span>,
    );
  });
  return <>{result}</>;
}

/** Left rail: Kṛṣṇa — counsel side ( dusk / blue tone ) */
function KrishnaPanel() {
  return (
    <aside className="relative hidden lg:flex lg:h-full lg:w-[min(22rem,30vw)] xl:w-[min(25rem,28vw)] flex-shrink-0 overflow-hidden border-r border-gita-line/90 bg-gita-field-warm">
      <Image
        src="/krishna-arjuna.png"
        alt=""
        fill
        className="object-cover opacity-[0.34] saturate-[0.9]"
        style={{ objectPosition: "20% center" }}
        sizes="(min-width: 1280px) 25rem, 22rem"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-gita-field-warm/72 via-gita-field-warm/58 to-gita-field-warm/95" aria-hidden />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-gita-ivory" aria-hidden />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-end gap-4 px-5 pb-28 pt-8 lg:pb-36">
        <div className="space-y-2 px-2 text-center font-sans">
          <p className="text-[13px] font-bold text-gita-peacock tracking-wide">
            <span className="font-devanagari">कृष्ण</span>
            <span className="uppercase tracking-[0.18em]"> · Kṛṣṇa</span>
          </p>
          <p className="text-[12px] font-semibold leading-snug text-gita-earth">Replies drawn from scripture in the corpus.</p>
        </div>
        <p className="max-w-[15rem] text-center font-sans text-[12px] font-medium leading-relaxed text-gita-earth/80">
          One steadied voice beside the question.
        </p>
      </div>
    </aside>
  );
}

/** Right rail: Arjuna — the questioner */
function ArjunaPanel() {
  return (
    <aside className="relative hidden lg:flex lg:h-full lg:w-[min(22rem,30vw)] xl:w-[min(25rem,28vw)] flex-shrink-0 overflow-hidden border-l border-gita-line/90 bg-gita-field-warm">
      <Image
        src="/krishna-arjuna.png"
        alt=""
        fill
        className="object-cover opacity-[0.36] saturate-[0.88]"
        style={{ objectPosition: "78% center" }}
        sizes="(min-width: 1280px) 25rem, 22rem"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-l from-gita-field-warm/72 via-gita-field-warm/58 to-gita-field-warm/95" aria-hidden />
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-l from-transparent to-gita-ivory" aria-hidden />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-end gap-4 px-5 pb-28 pt-8 lg:pb-36">
        <div className="space-y-2 px-2 text-center font-sans">
          <p className="text-[13px] font-bold text-gita-brass tracking-wide">
            <span className="font-devanagari">अर्जुन</span>
            <span className="uppercase tracking-[0.18em]"> · Arjuna</span>
          </p>
          <p className="text-[12px] font-semibold leading-snug text-gita-earth">You speak for yourself, plainly.</p>
        </div>
        <p className="max-w-[15rem] text-center font-sans text-[12px] font-medium leading-relaxed text-gita-earth/80">
          Bring the doubt, the duty, or the bind.
        </p>
      </div>
    </aside>
  );
}

function EmptyState({ onSend, busy }: { onSend: (s: string) => void; busy: boolean }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="relative flex items-start gap-5">
        <div className="flex flex-col items-center gap-1">
          <KrishnaAvatar />
          <span className="font-display text-[9px] uppercase tracking-[0.22em] text-gita-peacock">Kṛṣṇa</span>
        </div>
        <div className="h-px w-10 self-center bg-gradient-to-r from-transparent via-gita-line to-transparent opacity-70" aria-hidden />
        <div className="flex flex-col items-center gap-1">
          <ArjunaAvatar />
          <span className="font-display text-[9px] uppercase tracking-[0.22em] text-gita-brass">Arjuna</span>
        </div>
      </div>
      <div className="glass-panel relative max-w-md rounded-[1.75rem] px-6 py-7 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-gita-saffron">Kurukshetra · converse</p>
        <h2 className="mt-3 font-display text-[1.4rem] font-semibold leading-snug tracking-tight text-gita-earth sm:text-[1.55rem]">
          Between two armies, the{" "}
          <span className="text-dawn-gradient">honest questions</span> begin.
        </h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-gita-muted">
          Chat in your own words. Replies stay conversational and cite only passages the app can retrieve — scripture aimed at what actually bothers you tonight.
        </p>
      </div>
      <div className="relative w-full max-w-lg space-y-2">
        <p className="mb-1 text-center font-mono text-[9px] uppercase tracking-wider text-gita-muted">
          Opening moves (tap to send)
        </p>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => onSend(s)}
            className="w-full rounded-2xl border border-gita-line/60 bg-white/90 px-4 py-3.5 text-left text-[13px] leading-relaxed text-gita-earth shadow-md shadow-gita-earth/5 transition hover:border-gita-saffron/40 hover:bg-gita-ivory hover:shadow-lg disabled:opacity-40"
          >
            <span className="mr-2 font-display text-[10px] text-gita-brass">〉</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatExperience() {
  const { user, loading: authLoading, firebaseReady, signInWithGoogle, signOutUser } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceRef[] | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const dailyVerse = DAILY_VERSES[Math.floor(Date.now() / 86400000) % DAILY_VERSES.length];

  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    setSpeechSupported(true);
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript ?? "";
      }
      if (!transcript) return;
      setInput((prev) => {
        const spacer = prev && !prev.endsWith(" ") ? " " : "";
        return `${prev}${spacer}${transcript}`.trimStart();
      });
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }
    setError(null);
    setListening(true);
    recognition.start();
    textareaRef.current?.focus();
  }, [listening]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (!user) {
      setError("Please sign in first to start a conversation.");
      return;
    }
    setError(null);
    setSources(null);
    setShowSources(false);
    setBusy(true);

    const historySnapshot: ChatHistoryMessage[] = messages
      .filter((m) => m.content.trim() !== "")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    let acc = "";
    setMessages((m) => [...m, { role: "assistant", content: "", lang }]);

    await streamChat(
      trimmed,
      (t) => {
        acc += t;
        setMessages((m) => {
          const next = [...m];
          const last = next[next.length - 1];
          if (last?.role === "assistant") next[next.length - 1] = { ...last, content: acc };
          return next;
        });
      },
      (e) => setError(e.message),
      historySnapshot,
      lang,
    );

    setBusy(false);
    textareaRef.current?.focus();
    try {
      const s = await fetchSources(trimmed);
      if (s.sources?.length) setSources(s.sources);
    } catch {
      /* optional */
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input;
    setInput("");
    void send(t);
  };

  const copyMessage = (content: string, idx: number) => {
    void navigator.clipboard.writeText(content).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  return (
    <div className="relative isolate flex h-screen overflow-hidden bg-gita-field-warm font-sans text-gita-earth">
      <KrishnaPanel />

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col border-x border-gita-line/90 bg-gita-ivory/95 shadow-[0_0_70px_rgba(15,23,42,0.08)] backdrop-blur">
        <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gita-line/80 bg-white/92 px-4 py-3.5 backdrop-blur-xl sm:px-6">
          <Link href="/" className="group min-w-0">
            <p className="truncate font-display text-sm font-bold tracking-tight text-gita-peacock group-hover:text-gita-twilight md:text-[15px]">
              Bhagavad Gita
              <span className="font-sans font-semibold text-gita-muted"> · </span>
              <span className="text-gita-saffron">Dialogue</span>
            </p>
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-gita-muted">
              Plain speech · anchored replies
            </p>
          </Link>
          <div className="hidden max-w-[14rem] text-center font-sans text-[10px] font-medium leading-snug text-gita-muted sm:block md:text-[11px]">
            Threads tied to passages in our text · verify in your own book
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
              title={lang === "en" ? "Switch to Hindi responses" : "हिंदी से अंग्रेज़ी पर स्विच करें"}
              className={`flex items-center gap-1 rounded-sm border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                lang === "hi"
                  ? "border-gita-saffron bg-gita-saffron/10 text-gita-saffron"
                  : "border-gita-line/70 bg-white text-gita-muted hover:border-gita-saffron/40 hover:text-gita-peacock"
              }`}
            >
              <span className={lang === "hi" ? "font-devanagari" : ""}>
                {lang === "hi" ? "हिं" : "EN"}
              </span>
              <span className="text-gita-line/70">·</span>
              <span className={lang === "en" ? "font-devanagari" : ""}>
                {lang === "en" ? "हिं" : "EN"}
              </span>
            </button>
            {authLoading ? (
              <span className="text-[10px] text-gita-muted">…</span>
            ) : user?.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.image}
                alt=""
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-full object-cover ring-1 ring-gita-brass-bright/30"
              />
            ) : user ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gita-peacock text-[10px] font-semibold text-gita-ivory">
                {user.name?.[0]?.toUpperCase() ?? "·"}
              </div>
            ) : null}
            {!authLoading && user ? (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="btn-secondary rounded-sm px-2.5 py-1 text-[11px]"
              >
                Sign out
              </button>
            ) : null}
            {!authLoading && !user ? (
              <button
                type="button"
                disabled={!firebaseReady}
                onClick={() =>
                  void (async () => {
                    const r = await signInWithGoogle();
                    if (r.message) setError("Sign-in failed. Please try again or contact admin.");
                  })()
                }
                className="btn-primary rounded-sm px-3 py-1.5 text-[11px] disabled:opacity-40"
              >
                Sign in
              </button>
            ) : null}
            <Link href="/chat" className="btn-secondary rounded-sm px-2.5 py-1 text-[11px]">
              Dialogue
            </Link>
            <Link href="/journal" className="btn-secondary rounded-sm px-2.5 py-1 text-[11px]">
              Journal
            </Link>
            <Link href="/stories" className="btn-secondary rounded-sm px-2.5 py-1 text-[11px]">
              Stories
            </Link>
          </div>
        </header>

        <div className="chat-scroll relative flex-1 overflow-y-auto bg-gradient-to-b from-white via-gita-field-warm/85 to-white px-4 py-5 sm:px-8">
          {messages.length === 0 ? (
            <EmptyState onSend={(s) => void send(s)} busy={busy} />
          ) : (
            <div className="mx-auto max-w-2xl space-y-8 pb-6">
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                const isEmpty = !isUser && i === messages.length - 1 && busy && !m.content;

                if (isUser) {
                  return (
                    <div key={`${i}-u`} className="flex flex-col items-end gap-1">
                      <div className="mr-0 flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gita-brass">
                          Arjuna · <span className="font-devanagari normal-case tracking-normal">अर्जुन</span>
                        </span>
                        <ArjunaAvatar />
                      </div>
                      <div className="max-w-[92%] rounded-2xl border border-gita-brass-bright/20 bg-gradient-to-br from-gita-brass-bright/18 to-gita-chariot px-4 py-3 text-[14px] leading-[1.75] text-gita-earth shadow-sm sm:max-w-[85%]">
                        {m.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`${i}-a`} className="flex flex-col items-start gap-1">
                    <div className="ml-0 flex items-center gap-2">
                      <KrishnaAvatar />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gita-peacock">
                        Kṛṣṇa · <span className="font-devanagari normal-case tracking-normal">कृष्ण</span>
                      </span>
                    </div>
                    <div className="max-w-[92%] rounded-2xl border border-gita-line/90 bg-white px-4 py-3 shadow-sm ring-1 ring-gita-peacock/5 sm:max-w-[90%]">
                      {isEmpty ? (
                        <TypingDots />
                      ) : (
                        <div className={`border-l-[3px] border-gita-brass-bright pl-3 text-[14px] leading-[1.85] text-gita-earth ${m.lang === "hi" ? "font-devanagari" : "font-sans"}`}>
                          {renderContent(m.content)}
                        </div>
                      )}
                      {!isEmpty && m.content && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 font-sans">
                          <button
                            type="button"
                            onClick={() => copyMessage(m.content, i)}
                            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gita-muted hover:text-gita-peacock transition-colors"
                          >
                            <CopyIcon />
                            {copied === i ? "Copied" : "Copy"}
                          </button>
                          {sources && sources.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowSources((v) => !v)}
                              className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gita-peacock hover:underline"
                            >
                              <BookIcon />
                              Sources ({sources.length})
                            </button>
                          )}
                        </div>
                      )}
                      {showSources && sources && (
                        <ul className="mt-4 space-y-1 pt-4 font-mono text-[10px] text-gita-muted">
                          {sources.map((s) => (
                            <li key={s.id} className="flex flex-wrap gap-2">
                              <span className="text-gita-peacock">{s.id.slice(0, 8)}…</span>
                              {s.source && <span>{s.source}</span>}
                              {s.page != null && s.page >= 0 && <span>p.{s.page}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start justify-between gap-3 border-t border-red-200/70 bg-red-50/80 px-5 py-3">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-[13px] font-medium text-red-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-700 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <footer className="relative flex-shrink-0 border-t border-gita-line/80 bg-white/92 px-4 py-3 backdrop-blur-xl shadow-[0_-16px_40px_rgba(15,23,42,0.06)] sm:px-8">
          <div className="mb-2 flex gap-3 rounded-2xl border border-gita-line/80 bg-gradient-to-r from-white to-gita-field-warm px-3 py-2.5 shadow-sm">
            <KrishnaAvatar />
            <div className="min-w-0">
              <p className="font-display text-[8px] uppercase tracking-[0.2em] text-gita-brass">śloka for today</p>
              <p className="font-sans text-xs leading-snug text-gita-earth">
                <span>&ldquo;{dailyVerse.text}&rdquo;</span>{" "}
                <span className="not-italic font-mono text-[10px] text-gita-peacock">{dailyVerse.ref}</span>
              </p>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-gita-muted">Krishna replies in</span>
            <div className="inline-flex items-center rounded-full border border-gita-line/70 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                  lang === "en"
                    ? "bg-gita-saffron text-gita-ivory shadow-sm"
                    : "text-gita-muted hover:text-gita-peacock"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold transition-colors ${
                  lang === "hi"
                    ? "bg-gita-saffron text-gita-ivory shadow-sm font-devanagari"
                    : "text-gita-muted hover:text-gita-peacock font-devanagari"
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="flex items-end gap-3 rounded-2xl border border-gita-line/50 bg-white/95 px-3 py-2.5 shadow-inner shadow-gita-peacock/5 ring-2 ring-transparent transition focus-within:border-gita-saffron/45 focus-within:ring-gita-peacock/15">
              <ArjunaAvatar />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Speak as Arjuna would—your doubt, your bind, one honest question…"
                rows={1}
                disabled={busy}
                className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-1 font-sans text-sm leading-relaxed text-gita-earth placeholder:text-gita-muted/70 focus:outline-none disabled:opacity-45"
                style={{ scrollbarWidth: "none" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                }}
              />
              {speechSupported ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={busy}
                  title={listening ? "Stop listening" : "Speak your question"}
                  aria-label={listening ? "Stop speech input" : "Start speech input"}
                  aria-pressed={listening}
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition ${
                    listening
                      ? "border-gita-saffron bg-gita-saffron/15 text-gita-saffron ring-2 ring-gita-saffron/25"
                      : "border-gita-line/70 bg-white text-gita-muted hover:border-gita-saffron/40 hover:text-gita-peacock"
                  } disabled:cursor-not-allowed disabled:opacity-25`}
                >
                  <MicIcon active={listening} />
                </button>
              ) : null}
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gita-saffron to-gita-ember text-gita-ivory transition-opacity disabled:cursor-not-allowed disabled:opacity-25 hover:from-gita-saffron-soft hover:to-gita-saffron"
              >
                <SendIcon />
              </button>
            </div>
            <p className="mt-1 flex justify-between font-mono text-[8px] uppercase tracking-[0.15em] text-gita-muted px-1">
              <span>{listening ? "Listening… tap mic to stop" : "Your reins — speech or type"}</span>
              <span>His reins — scripture</span>
            </p>
          </form>
        </footer>
      </div>

      <ArjunaPanel />
    </div>
  );
}
