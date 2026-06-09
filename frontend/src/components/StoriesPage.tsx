"use client";

import Image from "next/image";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";

type StoryTheme = {
  /** Image overlay gradient */
  overlay: string;
  /** Card image backdrop */
  backdrop: string;
  /** Selected card ring / border */
  ring: string;
  hoverBorder: string;
  /** Era badge on card */
  badge: string;
  /** Epithet + accents */
  accent: string;
  accentText: string;
  /** Detail panel quote box */
  quote: string;
};

type Story = {
  id: string;
  name: string;
  epithet: string;
  era: string;
  summary: string;
  body: string[];
  image: string;
  imageAlt: string;
  imageCredit: string;
  imageSourceUrl?: string;
  theme: StoryTheme;
  gitaLink?: string;
};

const STORIES: Story[] = [
  {
    id: "shikhandi",
    name: "Shikhandi",
    epithet: "Amba reborn · breaker of a vow",
    era: "Kurukshetra",
    image: "/stories/shikhandi.jpg",
    imageAlt: "Battle scene between Kripa and Shikhandi, Mahabharata manuscript painting",
    imageCredit: "Wikimedia Commons · Mahabharata manuscript (public domain)",
    theme: {
      overlay: "from-emerald-950/75 via-teal-900/20 to-transparent",
      backdrop: "from-emerald-100 via-teal-50 to-white",
      ring: "ring-emerald-500/35 border-emerald-400/50 shadow-emerald-900/10",
      hoverBorder: "hover:border-emerald-400/45 hover:shadow-emerald-900/10",
      badge: "text-emerald-900",
      accent: "text-emerald-700",
      accentText: "text-emerald-800",
      quote: "border-emerald-200/80 bg-emerald-50/90 text-emerald-900",
    },
    summary:
      "Born as Amba, denied marriage and vengeance in one life, reborn to fulfil a destiny that would reshape the thirteenth day of war—and the meaning of dharma under impossible vows.",
    body: [
      "In an earlier life Shikhandi was Amba, eldest daughter of the king of Kashi. Bhishma, bound by his vow of celibacy and his duty to Hastinapura, carried her away with her sisters for Vichitravirya—but Amba had already chosen Shalva. When Bhishma returned her, Shalva refused her. Amba turned to Bhishma himself; he could not marry. Her rage became tapas. Shiva granted her a boon: in her next birth she would be the cause of Bhishma's fall.",
      "Reborn to Drupada, she was first a girl named Shikhandini. Raised as a prince, she later gained manhood through divine exchange—becoming Shikhandi. On the battlefield of Kurukshetra, Bhishma would not fight one who had been a woman; Arjuna stood behind Shikhandi, and the grandsire's long resistance ended.",
      "Shikhandi is often reduced to a tactical footnote. Read fully, the story asks: what happens when vows, gender, and justice collide across lifetimes? The Gita's field is not only chariots and arrows—it is the weight of choices made before the dialogue with Krishna even begins.",
    ],
    gitaLink:
      "The war in which Shikhandi acts unfolds on the same plain where the Gita is spoken—duty, identity, and consequence interwoven.",
  },
  {
    id: "draupadi",
    name: "Draupadi",
    epithet: "Fire-born queen · voice in the assembly",
    era: "Exile & Kurukshetra",
    image: "/stories/draupadi.jpg",
    imageAlt: "Draupadi with the five Pandavas, bazaar art c.1910–20",
    imageCredit: "Wikimedia Commons · public domain (India)",
    theme: {
      overlay: "from-rose-950/70 via-orange-900/15 to-transparent",
      backdrop: "from-rose-100 via-orange-50 to-white",
      ring: "ring-rose-500/35 border-rose-400/50 shadow-rose-900/10",
      hoverBorder: "hover:border-rose-400/45 hover:shadow-rose-900/10",
      badge: "text-rose-900",
      accent: "text-rose-700",
      accentText: "text-rose-800",
      quote: "border-rose-200/80 bg-rose-50/90 text-rose-900",
    },
    summary:
      "Emerging from the sacrificial fire, she became queen to five Pandavas—and witness to humiliation in the hall of dice that set the epic toward war.",
    body: [
      "Draupadi was not born from a womb in the ordinary way; she arose from the yajna of Drupada, a princess with a warrior's fire. Her marriage to five brothers, ordained by fate and dharma, made her the moral centre of the Pandava household.",
      "When Yudhishthira wagered everything—including her—in the dice game, Draupadi's question in the Kuru court still echoes: does a man who has lost himself have the right to stake another? Her humiliation and her refusal to accept silence as justice fuel the long road to Kurukshetra.",
      "She is not a passive symbol. She demands accountability, survives exile, and walks into war with grief sharpened into clarity. Her story reminds us that dharma is tested not only in solitude on a chariot, but in public rooms where power hides behind ritual.",
    ],
  },
  {
    id: "kunti",
    name: "Kunti",
    epithet: "Mother of kings · keeper of secrets",
    era: "Before & during the war",
    image: "/stories/kunti.jpg",
    imageAlt: "Kunti leading Gandhari, Razmnama miniature, 1598",
    imageCredit: "Wikimedia Commons · Dhanu, Razmnama (public domain)",
    theme: {
      overlay: "from-amber-950/70 via-yellow-900/10 to-transparent",
      backdrop: "from-amber-100 via-yellow-50 to-white",
      ring: "ring-amber-500/35 border-amber-400/50 shadow-amber-900/10",
      hoverBorder: "hover:border-amber-400/45 hover:shadow-amber-900/10",
      badge: "text-amber-900",
      accent: "text-amber-700",
      accentText: "text-amber-900",
      quote: "border-amber-200/80 bg-amber-50/90 text-amber-950",
    },
    summary:
      "Raised Karna in secrecy, guided the Pandavas through exile, and embodied the painful gap between love, duty, and truth.",
    body: [
      "Kunti received a boon in youth and bore Karna before marriage—then placed him in the river, a secret she carried for decades. As queen and mother, she shaped Yudhishthira, Bhima, Arjuna, and the twins with discipline and devotion.",
      "Her strength is quiet and relentless: sending the Pandavas into exile rather than civil war, urging them toward righteousness while knowing the cost. When Karna finally learns the truth, it is Kunti's confession that breaks the symmetry of the battlefield.",
      "In the Gita's world, Arjuna's crisis is personal—but Kunti represents the generational weight behind it: every warrior on the field is someone's child, and every secret has a reckoning.",
    ],
  },
  {
    id: "gandhari",
    name: "Gandhari",
    epithet: "Blindfolded queen · mother of a hundred",
    era: "Hastinapura",
    image: "/stories/gandhari.jpg",
    imageAlt: "Gandhari with maids, Pahari illustration c.1820",
    imageCredit: "Wikimedia Commons · attributed to Purkhu (public domain)",
    theme: {
      overlay: "from-stone-950/75 via-slate-900/20 to-transparent",
      backdrop: "from-stone-200 via-slate-100 to-white",
      ring: "ring-stone-500/30 border-stone-400/45 shadow-stone-900/10",
      hoverBorder: "hover:border-stone-400/45 hover:shadow-stone-900/10",
      badge: "text-stone-800",
      accent: "text-stone-600",
      accentText: "text-stone-800",
      quote: "border-stone-300/80 bg-stone-100/90 text-stone-800",
    },
    summary:
      "Chose to share her husband's blindness, bore a hundred sons, and watched dharma unravel from the inner chambers of the palace.",
    body: [
      "Gandhari married Dhritarashtra and bound her eyes in solidarity with his blindness—a vow of empathy that also kept her from witnessing the court's cruelties directly, yet did not spare her their consequences.",
      "As mother of the Kauravas, she is torn between maternal love and moral horror. She curses Krishna and the Yadavas at the war's end, not from malice alone but from the collapse of a kingdom she tried to hold together with restraint.",
      "Her story complicates easy sides: grief is not only for the righteous. Gandhari asks whether loyalty to family can become complicity—and whether a blindfold is penance, protection, or both.",
    ],
  },
  {
    id: "subhadra",
    name: "Subhadra",
    epithet: "Krishna's sister · mother of Abhimanyu",
    era: "Marriage & war",
    image: "/stories/subhadra.jpg",
    imageAlt: "Arjuna and Subhadra, painting by Raja Ravi Varma",
    imageCredit: "Wikimedia Commons · Raja Ravi Varma (public domain)",
    theme: {
      overlay: "from-violet-950/70 via-indigo-900/15 to-transparent",
      backdrop: "from-violet-100 via-indigo-50 to-white",
      ring: "ring-violet-500/35 border-violet-400/50 shadow-violet-900/10",
      hoverBorder: "hover:border-violet-400/45 hover:shadow-violet-900/10",
      badge: "text-violet-900",
      accent: "text-violet-700",
      accentText: "text-violet-900",
      quote: "border-violet-200/80 bg-violet-50/90 text-violet-900",
    },
    summary:
      "Sister of Krishna and Balarama, wife of Arjuna, and mother whose son's death on the thirteenth day deepened the war's sorrow.",
    body: [
      "Subhadra's marriage to Arjuna was itself an episode of strategy and love—Krishna counselled abduction when peaceful union was blocked, a reminder that dharma sometimes moves through bold, unconventional paths.",
      "She is often in the margins of the epic, yet her son Abhimanyu's breaching of the chakravyuha and death inside it is one of the war's most devastating turns. Subhadra embodies the Vrishni line's bond with the Pandavas: divine kinship woven into human loss.",
      "Her presence links the Gita's speaker to the battlefield's grief—not Krishna as distant god alone, but brother, uncle, and guide to a family that will bleed.",
    ],
  },
  {
    id: "satyavati",
    name: "Satyavati",
    epithet: "Fisher-queen · matriarch of the dynasty",
    era: "Origins of Hastinapura",
    image: "/stories/satyavati.jpg",
    imageAlt: "Satyavati (Matsyagandha)",
    imageCredit: "Dainik Bhaskar · Jeevan Mantra (Dharm)",
    imageSourceUrl:
      "https://www.bhaskar.com/jeevan-mantra/dharm/news/unknown-facts-of-satyawati-of-mahabharata-mahabahrata-facts-satyawati-and-shantanu-marriage-bhishm-pitamah-127776553.html",
    theme: {
      overlay: "from-cyan-950/65 via-sky-900/15 to-transparent",
      backdrop: "from-cyan-100 via-sky-50 to-white",
      ring: "ring-cyan-500/35 border-cyan-400/50 shadow-cyan-900/10",
      hoverBorder: "hover:border-cyan-400/45 hover:shadow-cyan-900/10",
      badge: "text-cyan-900",
      accent: "text-cyan-700",
      accentText: "text-cyan-900",
      quote: "border-cyan-200/80 bg-cyan-50/90 text-cyan-950",
    },
    summary:
      "From the banks of the Yamuna to the throne of Hastinapura, her choices set in motion the lineage that would reach Kurukshetra.",
    body: [
      "Satyavati was born of a celestial curse and raised among fishermen; her scent of musk and her encounter with Parashara produced Vyasa, compiler of the Mahabharata itself. Her marriage to Shantanu, conditional on her son's succession, altered the Kuru line forever.",
      "When both her sons died without heirs, she called upon Vyasa to continue the dynasty—leading to the births of Dhritarashtra, Pandu, and Vidura. Satyavati's pragmatism built an empire and a tragedy in the same breath.",
      "Long before the Gita is spoken, Satyavati's decisions remind us: epic wars begin in smaller rooms, with women who negotiate survival, power, and the future of a house.",
    ],
  },
];

function StoryGridCard({
  story,
  selected,
  onSelect,
}: {
  story: Story;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = story.theme;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex h-full flex-col overflow-hidden rounded-[1.35rem] border bg-white text-left shadow-sm transition-all duration-300 ${
        selected ? `shadow-md ${t.ring} ring-2` : `border-gita-line/70 ${t.hoverBorder} hover:-translate-y-1 hover:shadow-lg`
      }`}
    >
      <div className={`relative aspect-[5/4] w-full overflow-hidden bg-gradient-to-br ${t.backdrop}`}>
        <Image
          src={story.image}
          alt={story.imageAlt}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${t.overlay} opacity-90`} />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent" />
        <span
          className={`absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${t.badge}`}
        >
          {story.era}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight text-gita-earth transition-colors group-hover:opacity-90">
          {story.name}
        </h2>
        <p className={`mt-1 text-xs font-semibold ${t.accent}`}>{story.epithet}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-gita-muted">{story.summary}</p>
        <span className={`mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${t.accent}`}>
          {selected ? "Reading" : "Read story"}
          <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}

function StoryDetailPanel({ story }: { story: Story }) {
  const t = story.theme;
  return (
    <article
      id={`story-${story.id}`}
      className="overflow-hidden rounded-[1.75rem] border border-gita-line/70 bg-white shadow-lg shadow-black/5"
    >
      <div className="grid lg:grid-cols-[minmax(260px,340px)_1fr]">
        <div className={`relative min-h-[260px] bg-gradient-to-br ${t.backdrop} lg:min-h-full`}>
          <Image
            src={story.image}
            alt={story.imageAlt}
            fill
            className="object-cover object-center"
            sizes="340px"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${t.overlay}`} />
          <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 drop-shadow">{story.era}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-white drop-shadow-md sm:text-3xl">
              {story.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-white/95 drop-shadow">{story.epithet}</p>
          </div>
        </div>

        <div className="flex flex-col px-6 py-7 sm:px-8 sm:py-9">
          <p className="text-[15px] leading-relaxed text-gita-muted">{story.summary}</p>
          <div className={`my-6 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${t.accent}`} />
          <div className="space-y-4 text-[15px] leading-[1.85] text-gita-earth">
            {story.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {story.gitaLink ? (
            <blockquote className={`mt-8 rounded-2xl border px-5 py-4 text-sm italic leading-relaxed ${t.quote}`}>
              {story.gitaLink}
            </blockquote>
          ) : null}
          <p className="mt-6 text-[11px] text-gita-muted/80">
            Illustration: {story.imageCredit}
            {story.imageSourceUrl ? (
              <>
                {" · "}
                <a
                  href={story.imageSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-gita-line underline-offset-2 transition hover:text-gita-earth"
                >
                  View source
                </a>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </article>
  );
}

export function StoriesPage() {
  const [selectedId, setSelectedId] = useState<string>("shikhandi");
  const selected = STORIES.find((s) => s.id === selectedId) ?? STORIES[0];

  return (
    <div className="relative min-h-screen bg-[#fafafa] font-sans text-gita-earth">
      <AppNav />

      <div className="pointer-events-none absolute left-[4%] top-28 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute right-[6%] top-48 h-64 w-64 rounded-full bg-violet-200/35 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-32 left-[30%] h-80 w-80 rounded-full bg-cyan-200/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-16 right-[15%] h-56 w-56 rounded-full bg-rose-200/25 blur-3xl" aria-hidden />

      <main className="relative z-[1] mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <header className="mb-12 max-w-3xl">
          <p className="label mb-3">Voices often in the margins</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-gita-earth sm:text-4xl lg:text-[2.75rem]">
            Stories of{" "}
            <span className="bg-gradient-to-r from-rose-700 via-violet-700 to-teal-700 bg-clip-text text-transparent">
              female characters
            </span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gita-muted">
            Queens, mothers, and warriors whose choices ripple across the Mahabharata—including{" "}
            <strong className="font-semibold text-emerald-800">Shikhandi</strong>, whose story crosses gender, vow,
            and vengeance. Select a portrait to read the full story below.
          </p>
        </header>

        <section aria-label="Character portraits" className="mb-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-gita-earth">Choose a character</h2>
            <p className="text-xs text-gita-muted">{STORIES.length} stories · public-domain art</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((story) => (
              <StoryGridCard
                key={story.id}
                story={story}
                selected={selectedId === story.id}
                onSelect={() => {
                  setSelectedId(story.id);
                  requestAnimationFrame(() => {
                    document.getElementById(`story-${story.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  });
                }}
              />
            ))}
          </div>
        </section>

        <section aria-label="Story detail" className="scroll-mt-24">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-gita-line" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${selected.theme.accent}`}>
              Now reading · {selected.name}
            </span>
            <span className="h-px flex-1 bg-gita-line" />
          </div>
          <StoryDetailPanel story={selected} />
        </section>
      </main>
    </div>
  );
}
