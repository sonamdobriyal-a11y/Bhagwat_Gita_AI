"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";

/* ─── Types ───────────────────────────────────────────────────── */
interface Article {
  id: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  body: string[];          // paragraphs
  verse?: { text: string; ref: string };
  tags: string[];
  readTime: string;
  chapter?: string;
}

/* ─── Inline SVGs ─────────────────────────────────────────────── */
const ArrowRight = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TagIcon = ({ type }: { type: string }) => {
  const map: Record<string, string> = {
    "Meditation Notes": "✧",
    "Deep Reflection": "◈",
    "Philosophy": "✦",
    "Lifestyle Audit": "⊕",
    "Weekly Summary": "❋",
    "Intellectual Growth": "◎",
    "Karma Yoga": "◉",
  };
  return <span className="text-teal-700/80 opacity-90">{map[type] ?? "·"}</span>;
};

const SparkleIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
  </svg>
);

/* ─── Full article data ──────────────────────────────────────── */

const ALL_ARTICLES: Article[] = [
  {
    id: "finding-stillness",
    date: "October 24, 2023",
    category: "Deep Reflection",
    title: "Finding Stillness in the Chaos of Action",
    summary: "Today's meditation centred on Karma Yoga. I realised that my anxiety often stems from a desperate clinging to results rather than the integrity of the act itself.",
    body: [
      "Today's meditation centred on the concept of 'Karma Yoga'. I realised that my anxiety often stems from a desperate clinging to results rather than the integrity of the act itself.",
      "The Gita does not say to stop caring. It says to stop owning the outcome. When I submitted my project last week, I noticed how my sense of worth rose and fell with every piece of feedback. Krishna's teaching reframes this entirely: the action is your domain; the fruit is not.",
      "This subtle shift — from outcome-dependency to process-devotion — is perhaps the most quietly radical idea in all of philosophy. Modern productivity culture tells us to obsess over KPIs, metrics, conversion rates. The Gita inverts this. It says: bring your full intelligence and care to the act, then release it, as a river releases a boat onto the sea.",
      "Practically, this looks like: writing the essay as if it matters infinitely, then submitting it as if it were a leaf falling from a tree. Not detachment born of indifference, but detachment born of deep participation.",
      "I tried this with a difficult conversation today. I prepared carefully, chose words with intention, spoke with warmth — and then let the response belong entirely to the other person. The freedom in that was remarkable. Not the anxious waiting, but a quiet completion. I had done my part. The rest was not mine to carry.",
    ],
    verse: {
      text: "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called Yoga.",
      ref: "Gita 2.48",
    },
    tags: ["Equanimity", "Karma"],
    readTime: "6 min read",
    chapter: "Chapter 2",
  },
  {
    id: "nature-of-soul",
    date: "October 22, 2023",
    category: "Philosophy",
    title: "The Nature of the Soul",
    summary: "Reflecting on the immortality of the atman. If nothing can wither it, why do I fear change in the physical world?",
    body: [
      "Reflecting on the immortality of the atman. If nothing can wither it, why do I fear change in the physical world? This question has stayed with me all morning.",
      "The Gita's description of the Self in Chapter 2 is almost scientific in its precision. The soul cannot be cut, burned, wetted, or dried. It is eternal, all-pervading, immovable, and primeval. Krishna lists these qualities not as poetic comfort, but as metaphysical fact.",
      "If I genuinely believed this — not intellectually, but in the marrow — would loss still feel like destruction? Would failure feel like annihilation? The fear of losing a job, a relationship, a reputation: these fears are premised on the idea that we are the thing we stand to lose.",
      "The Gita's radical move is to say: you are not. The body changes; the circumstances shift; the roles we play are costumes on an eternal actor. The actor never dies.",
      "I find this both comforting and unsettling. Comforting because it means nothing essential can be taken. Unsettling because it demands I stop using my circumstances as my identity. That is a more difficult freedom to accept than most.",
    ],
    verse: {
      text: "The soul is never born nor dies at any time. It has not come into being, does not come into being, and will not come into being. It is unborn, eternal, ever-existing, and primeval.",
      ref: "Gita 2.20",
    },
    tags: ["Atman", "Impermanence"],
    readTime: "3 min read",
    chapter: "Chapter 2",
  },
  {
    id: "on-self-discipline",
    date: "October 20, 2023",
    category: "Meditation Notes",
    title: "On Self-Discipline",
    summary: "The mind is a restless friend or a dangerous enemy. Today I practised being the observer of my thoughts rather than their hostage.",
    body: [
      "The mind is a restless friend or a dangerous enemy. Today I practised being the observer of my thoughts rather than their hostage.",
      "Krishna tells Arjuna in Chapter 6 that for the one who has conquered the mind, it is the best of friends; for one who has failed to do so, it remains the greatest enemy. There is a clinical honesty in this. Most of us experience the mind as something that happens to us, not something we wield.",
      "In this morning's sit, I tried a simple technique: labelling each thought by type — planning, memory, craving, worry — without following the narrative. It took about seven minutes for the river to slow. Not stop. Slow.",
      "What struck me is that the Gita doesn't tell us to empty the mind. It describes a mastery that comes through practice (abhyasa) and dispassion (vairagya). These two — sustained effort and non-attachment to the effort itself — create a kind of inner climate where clarity becomes more frequent than turbulence.",
      "The discipline is not suppression. It is redirection. A wild horse trained, not broken.",
    ],
    verse: {
      text: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy.",
      ref: "Gita 6.6",
    },
    tags: ["Meditation", "Discipline"],
    readTime: "4 min read",
    chapter: "Chapter 6",
  },
  {
    id: "gunas-daily-life",
    date: "October 15, 2023",
    category: "Lifestyle Audit",
    title: "Gunas in Daily Life",
    summary: "Noticed how Rajas influences my work-life balance. Seeking more Sattva through morning rituals.",
    body: [
      "Noticed how Rajas — the guna of passion, activity, and restlessness — dominates my afternoons. The Gita's taxonomy of the three gunas (tamas, rajas, sattva) is one of its most practically applicable frameworks.",
      "Tamas is inertia and darkness. Rajas is frenetic motion. Sattva is luminous clarity. The Gita doesn't say rajas is bad — movement and energy are necessary for action — but an excess of it produces anxiety, agitation, and craving for stimulation.",
      "I mapped my day. Morning: sattvic (quiet, focused, creative). Afternoon: rajasic (meetings, noise, reactive). Evening: I oscillate between tamasic (screen-numbed collapse) and attempting sattvic recovery.",
      "The prescription in Chapter 14 is not to eliminate rajas but to use it consciously, then return to sattva. Practically: scheduled transitions between energy modes, physical movement to discharge rajasic energy, and morning rituals that prime the sattvic baseline before the day's heat arrives.",
      "Small experiment: no phone for the first 45 minutes after waking. Three days in, the quality of thinking in that window is noticeably different. More spacious. Less reactive. This is what the Gita means by cultivating sattva as a foundation.",
    ],
    verse: {
      text: "Sattva, rajas, and tamas — these three modes of material nature bind the eternal living entity to the perishable body.",
      ref: "Gita 14.5",
    },
    tags: ["Gunas", "Sattva", "Wellbeing"],
    readTime: "5 min read",
    chapter: "Chapter 14",
  },
  {
    id: "yoga-of-wisdom",
    date: "October 10, 2023",
    category: "Intellectual Growth",
    title: "The Yoga of Wisdom",
    summary: "Jnana Yoga exploration. Discriminating between the permanent and the transient in stressful moments.",
    body: [
      "Jnana Yoga exploration. Chapter 4 describes knowledge as a boat that carries even great sinners across the ocean of misery. But what kind of knowledge? Not factual accumulation. Viveka — discriminative wisdom.",
      "Viveka is the faculty of discernment: the capacity to distinguish between what is real and what is projected, between what is permanent and what is transient, between the Self and the roles we play.",
      "In a stressful meeting this week, I tried applying it in real-time. Someone spoke sharply to me. The immediate reaction was a contraction in the chest, a flare of defensiveness. Viveka asked: what is actually true here? Their words are a passing event. My sense of self-worth is not contingent on their mood. The contraction is a wave; it will pass.",
      "It passed in about forty seconds, instead of festering for hours. This is what intellectual yoga looks like in practice — not abstract philosophy, but a moment-to-moment choosing of clarity over reaction.",
      "The Gita says a single flame of wisdom is sufficient to illuminate the darkness of all our doubts. Not a chandelier — a single flame. That modesty is part of the teaching.",
    ],
    verse: {
      text: "Even if you are considered the most sinful of all sinners, you shall cross over the ocean of miseries by the boat of transcendental knowledge.",
      ref: "Gita 4.36",
    },
    tags: ["Jnana", "Wisdom", "Clarity"],
    readTime: "5 min read",
    chapter: "Chapter 4",
  },
  {
    id: "selfless-action",
    date: "October 18, 2023",
    category: "Karma Yoga",
    title: "The Art of Selfless Action",
    summary: "Nishkama Karma — action without desire for reward — is perhaps the most counter-cultural idea in existence.",
    body: [
      "Nishkama Karma — action without desire for reward — is one of the most counter-cultural ideas in existence. In a world obsessed with metrics, rankings, and ROI, practising detached action feels almost subversive. Yet the Gita frames it as the highest form of freedom: when you no longer need anything from an action, you are fully present in it.",
      "There is a paradox at the heart of this teaching. By releasing the grip on outcomes, we actually perform better. The energy that was spent on managing our image, calculating rewards, and bracing for failure is now available for the action itself. Anxiety is replaced by absorption.",
      "This week's experiment: perform three daily tasks — one creative, one social, one physical — with full effort and zero expectation of outcome. Journal the quality of your attention. The results may surprise you.",
      "On day one, I chose to write a long email to a difficult colleague with no expectation of a positive response. I focused only on clarity, kindness, and precision. Writing it took fifteen minutes instead of the usual forty-five, because I wasn't rehearsing their reactions. Whether they respond well is genuinely not my business.",
      "The Gita is not asking us to become indifferent. It is asking us to transfer our investment from the fruit to the seed — from the harvest to the planting. Ironically, those who plant most freely tend to reap most abundantly.",
    ],
    verse: {
      text: "Let right deeds be thy motive, not the fruit which comes from them.",
      ref: "Gita 2.47 (Edwin Arnold translation)",
    },
    tags: ["Nishkama", "Karma Yoga", "Freedom"],
    readTime: "7 min read",
    chapter: "Chapter 2–3",
  },
  {
    id: "dharma-modern-dilemma",
    date: "October 5, 2023",
    category: "Philosophy",
    title: "Dharma and the Modern Dilemma",
    summary: "What does it mean to follow your dharma in a world of infinite options?",
    body: [
      "What does it mean to follow your dharma in a world of infinite options? The Gita insists that right action is always contextual — tied to your specific nature, role, and moment.",
      "Chapter 3 contains one of the most frequently misunderstood verses: 'Better is one's own dharma, though imperfectly performed, than the dharma of another well-performed.' This sounds like advice to stay in your lane. But it is more nuanced than that.",
      "Dharma here is not merely your job or social role. It is the unique confluence of your capacities, your current circumstances, and the needs of those around you. Following it is not about staying comfortable — it often involves the hardest path precisely because it is yours.",
      "Arjuna's crisis is a dharmic crisis. He is a warrior by nature and training, standing on a battlefield that requires him to act as a warrior. His reluctance is understandable emotionally, but Krishna gently shows him that abandoning his dharma in the name of compassion is actually a confusion of identity, not a moral triumph.",
      "For us, the modern parallel might be: are you living the life that is actually yours, or the life that seems safe, socially legible, or emotionally easier? The Gita does not make this question comfortable. But it makes it unavoidable.",
    ],
    verse: {
      text: "It is better to perform one's own duties imperfectly than to master the duties of another.",
      ref: "Gita 3.35",
    },
    tags: ["Dharma", "Ethics"],
    readTime: "7 min read",
    chapter: "Chapter 3",
  },
  {
    id: "witnessing-restless-mind",
    date: "September 28, 2023",
    category: "Meditation Notes",
    title: "Witnessing the Restless Mind",
    summary: "The Gita describes the mind as more difficult to control than the wind. Today I stopped trying to silence it and simply watched.",
    body: [
      "The Gita describes the mind as more difficult to control than the wind. Today I stopped trying to silence it and simply watched. The noise diminished by itself.",
      "Arjuna says to Krishna: the mind is turbulent, obstinate, and very strong, O Krishna. I think it is more difficult to control than the wind. This is perhaps the most honest thing anyone has ever said about meditation.",
      "Most meditation instruction focuses on controlling the mind. But the Gita offers a different framing: the practice is not suppression, but witnessing. There is a part of you that is not the mind — that watches the mind as a bird watches a river from a branch.",
      "This morning I sat for twenty minutes with the explicit intention of not achieving anything. No breath counting. No mantra. Just watching. Within minutes, the inner narrator was running at full volume — replaying yesterday's conversations, planning tomorrow's tasks, judging this very practice.",
      "And then something subtle: a small gap between a thought and the next thought. A fraction of a second of clear sky. That gap is what the Gita calls chitta-vritti-nirodha — the stilling of the fluctuations of the mind. Not the absence of the river, but the recognition of the bank from which it is observed.",
    ],
    verse: {
      text: "The mind is restless, turbulent, obstinate and very strong, O Krishna, and to subdue it, I think, is more difficult than controlling the wind.",
      ref: "Gita 6.34",
    },
    tags: ["Meditation", "Mindfulness"],
    readTime: "5 min read",
    chapter: "Chapter 6",
  },
  {
    id: "fear-of-failure",
    date: "September 20, 2023",
    category: "Deep Reflection",
    title: "Fear of Failure and the Warrior's Code",
    summary: "Arjuna's paralysis is the original story of performance anxiety. Krishna's response is not 'don't be afraid' — it's 'understand what you truly are.'",
    body: [
      "Arjuna's paralysis is the original story of performance anxiety. Krishna's response is not 'don't be afraid' — it's 'understand what you truly are and fear becomes irrelevant.'",
      "Chapter 2 opens with Arjuna in the grip of what we would today call acute anxiety: trembling limbs, dry mouth, loss of will, inability to think clearly. This is not cowardice. This is a man of great ability facing a situation whose stakes feel annihilating.",
      "Krishna's response is fascinating for what it doesn't do. He does not offer reassurance ('it'll be fine'). He does not minimise the difficulty ('you're overthinking it'). He offers a radical reframe of identity: you are not what you are afraid of losing.",
      "The warrior's code the Gita presents is not bravado or suppression of fear. It is the courage that comes from understanding your own nature. If the Self cannot be destroyed, what exactly is there to fear? The outcome — victory or defeat — belongs to a dimension of existence that is, by nature, impermanent.",
      "I've been sitting with a significant professional risk this week. The fear it generates feels very real. But underneath the fear, I can locate a part of me that is watching with something like curiosity rather than terror. That is the part the Gita is speaking to.",
    ],
    verse: {
      text: "Yield not to this unmanliness, O Arjuna, it does not befit you. Shake off your cowardice and arise.",
      ref: "Gita 2.3",
    },
    tags: ["Courage", "Self-Worth"],
    readTime: "8 min read",
    chapter: "Chapter 2",
  },
  {
    id: "three-paths",
    date: "September 14, 2023",
    category: "Intellectual Growth",
    title: "The Three Paths: Karma, Jnana, Bhakti",
    summary: "Not everyone reaches the summit by the same trail. The Gita's genius is in offering three distinct yogas suited to different temperaments.",
    body: [
      "Not everyone reaches the summit by the same trail. The Gita's genius is in offering three distinct yogas — action, knowledge, devotion — suited to different temperaments.",
      "Karma Yoga is for the person whose nature is active. They cannot sit still; they find meaning in doing. The Gita does not ask them to become a contemplative — it asks them to transform how they act. Act without ego-ownership of results. Act as service. This is the path of the worker made sacred.",
      "Jnana Yoga is for the person whose nature is analytical, who reaches truth through relentless inquiry. Who am I, really? What is permanent? What is real? This is the path of the philosopher, and it demands extraordinary honesty about the contents of one's own mind.",
      "Bhakti Yoga is for the person whose nature is devotional, who loves before they understand. This path transforms emotion into a vehicle for transcendence. The beloved may be a deity, a teacher, a principle — what matters is the purity of the love, not its object.",
      "Most people I know are combinations of all three. The Gita allows for this. The paths are not mutually exclusive — they are facets of a single jewel. The question is: which facet catches the most light in you right now?",
    ],
    verse: {
      text: "Those who fix their minds on my personal form and are always engaged in worshipping Me with great and transcendental faith are considered by Me to be most perfect.",
      ref: "Gita 12.2",
    },
    tags: ["Yoga", "Paths", "Temperament"],
    readTime: "9 min read",
    chapter: "Chapter 12",
  },
  {
    id: "food-sleep-consciousness",
    date: "September 7, 2023",
    category: "Lifestyle Audit",
    title: "Food, Sleep and Consciousness",
    summary: "Chapter 17 surprised me: the Gita has an opinion on diet. Sattvic food is described as 'dear to those in goodness.'",
    body: [
      "Chapter 17 surprised me: the Gita has an opinion on diet. Sattvic food is described as 'dear to those in goodness' — light, nourishing, and conducive to clarity. Rajasic food is described as too bitter, too salty, too sour — causing agitation and craving. Tamasic food is stale, putrid, and leftover — associated with darkness and torpor.",
      "At first this seems like an ancient health fad. But the underlying principle is more interesting: what we consume affects the quality of our consciousness. Not just food — information, entertainment, conversation, sleep — these are all forms of consumption.",
      "I tracked my own consumption for a week. Sattvic inputs: long walks, reading philosophy, deep conversations, whole foods, early sleeping. Rajasic inputs: social media, news cycles, coffee after noon, late nights, competitive comparison. Tamasic inputs: junk content, oversleeping, excessive alcohol, processed snacks.",
      "The correlation with mental quality the next morning was strikingly consistent. Heavy rajasic evening → scattered, agitated morning. Sattvic evening → spacious, clear morning. This is not mysticism; it's basic psychophysiology.",
      "The Gita isn't asking for austerity. It's asking for attention. Notice what you are feeding your mind. Adjust. Return to sattva as your baseline. This is perhaps the most practical wellness advice in any philosophical text.",
    ],
    verse: {
      text: "Foods dear to those in the mode of goodness increase the duration of life, purify one's existence and give strength, health, happiness and satisfaction.",
      ref: "Gita 17.8",
    },
    tags: ["Sattva", "Wellbeing", "Practice"],
    readTime: "5 min read",
    chapter: "Chapter 17",
  },
  {
    id: "letting-go",
    date: "August 30, 2023",
    category: "Weekly Summary",
    title: "What I Learned from Letting Go",
    summary: "A month of practising non-attachment. The surprising result: not numbness, but a more vivid engagement with life.",
    body: [
      "A month of practising non-attachment. The surprising result: not numbness, but a more vivid engagement with life — because the fear of loss no longer clouds the present.",
      "When I began this experiment, I expected to feel detached in the wrong sense — emotionally flat, less invested, passive. What I discovered is almost the inverse. Releasing the grip on outcomes creates space for genuine presence.",
      "Verse 2.71 describes the person who has abandoned all desires and moves without longing, without ego, without possessiveness — such a one attains peace. This sounds like the description of someone who has stopped caring. But in practice, it is someone who cares completely, in the moment, without the distortion of personal agenda.",
      "Think of a great artist who is absorbed in their work — not thinking about the review or the gallery or the money — but utterly in the act of making. That absorption is what non-attachment looks like in motion. It isn't detachment. It's presence uncontaminated by anxiety.",
      "The month taught me that most of what I call 'caring about something' is actually anxiety about that thing. True care is different — it is generous, patient, and not threatened by outcomes. Vairagya, properly understood, is not renunciation of life. It is the precondition for full participation in it.",
    ],
    verse: {
      text: "A person who has given up all desires for sense gratification, who lives free from desires, who has given up all sense of proprietorship and is devoid of false ego — he alone can attain real peace.",
      ref: "Gita 2.71",
    },
    tags: ["Vairagya", "Non-attachment", "Peace"],
    readTime: "6 min read",
    chapter: "Chapter 2",
  },
  {
    id: "path-of-devotion",
    date: "October 21, 2023",
    category: "Weekly Summary",
    title: "The Path of Devotion",
    summary: "This week focused on Bhakti. Every small action can be an offering.",
    body: [
      "This week focused on Bhakti Yoga — the path of devotion. The realisation that every small action can be an offering transformed my perspective on daily chores.",
      "Bhakti is often misunderstood as ritualism or emotional religiosity. The Gita's version is subtler: it is the orientation of the whole being toward something greater than the personal ego. What you offer it to — deity, principle, love itself — is less important than the quality of the offering.",
      "Chapter 9 contains one of the most democratising verses in all of spiritual literature: 'If one offers Me with love and devotion a leaf, a flower, a fruit, or water, I will accept it.' The currency is not grandeur. It is sincerity.",
      "I tried bringing this quality of attention to things I usually do on autopilot: cooking a meal, making a bed, sending an email. When approached as offerings — things done with care for their own sake — these actions feel qualitatively different. Less like tasks to be dispatched, more like moments to be inhabited.",
      "Three new insights crystallised this week: devotion is not weakness but an intelligence of the heart; every act of genuine attention is a form of prayer; and the most radical thing one can do in a distracted culture is to be completely present.",
    ],
    verse: {
      text: "Whatever you do, whatever you eat, whatever you offer or give away, and whatever austerities you perform — do that as an offering to Me.",
      ref: "Gita 9.27",
    },
    tags: ["Bhakti", "Devotion", "Presence"],
    readTime: "5 min read",
    chapter: "Chapter 9",
  },
];

/** QUOTE_CARD — decorative only */
const QUOTE_CARD = {
  quote: "Yoga is the journey of the self, through the self, to the self.",
  ref: "Bhagavad Gita 6.20",
  gradient: "linear-gradient(160deg, #312e81 0%, #0f766e 55%, #164e63 100%)",
};

/** Filter categories */
const FILTERS = ["All", "Deep Reflection", "Philosophy", "Meditation Notes", "Lifestyle Audit", "Weekly Summary", "Intellectual Growth", "Karma Yoga"];

/* ─── Sub-components ─────────────────────────────────────────── */

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-700 font-sans">
      <TagIcon type={label} />
      {label}
    </span>
  );
}

/* ─── Article Detail Modal ───────────────────────────────────── */

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[1.5rem] border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/30">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[1.5rem] border-b border-slate-200/80 bg-white/95 px-6 py-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="font-semibold uppercase tracking-wider text-slate-500">{article.date}</span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold uppercase tracking-wider text-teal-700">{article.category}</span>
            {article.chapter && (
              <>
                <span className="text-slate-300">·</span>
                <span className="chapter-label">{article.chapter}</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Close article"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 pb-10 pt-5 font-serif">
          <h2 className="font-serif text-[1.375rem] font-normal leading-snug text-slate-900 sm:text-[1.5rem]">
            {article.title}
          </h2>
          <p className="mt-2 font-mono text-[10px] tracking-wide uppercase text-slate-500">
            {article.readTime}
          </p>

          {article.verse && (
            <div className="my-6 rounded-r-xl border-l-[3px] border-indigo-400 bg-indigo-50/60 px-5 py-4">
              <p className="text-[0.9375rem] leading-relaxed not-italic text-slate-700">
                &ldquo;{article.verse.text}&rdquo;
              </p>
              <p className="mt-2 font-mono text-[11px] font-medium text-indigo-700">{article.verse.ref}</p>
            </div>
          )}

          <div className="space-y-5">
            {article.body.map((para, i) => (
              <p key={i} className="text-[14px] leading-[1.8] text-slate-600">
                {para}
              </p>
            ))}
          </div>

          <hr className="manuscript-rule my-8 w-full max-w-[6rem]" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </div>
            <Link
              href={`/chat?q=${encodeURIComponent(article.title)}`}
              className="btn-primary inline-flex items-center gap-2 rounded-sm px-4 py-2 text-[12px] whitespace-nowrap"
            >
              Open in dialogue <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Small article card (used in extra grid) ────────────────── */
function ArticleCard({ article, onOpen }: { article: Article; onOpen: (a: Article) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(article)}
      className="card group cursor-pointer rounded-sm border-slate-200/80 p-5 text-left transition-colors hover:border-teal-300/60 w-full"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 font-sans">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">{article.date}</span>
        <span className="text-slate-300">·</span>
        <span className="font-semibold uppercase tracking-wider text-indigo-700/90">{article.category}</span>
      </div>
      <h3 className="font-serif text-[1.0625rem] font-medium leading-snug text-slate-900 group-hover:text-teal-900 transition-colors">
        {article.title}
      </h3>
      <p className="mt-2 font-sans text-[13px] leading-relaxed text-slate-600">{article.summary}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {article.tags.slice(0, 2).map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
        <span className="font-mono text-[10px] text-slate-500">{article.readTime}</span>
      </div>
      <div className="mt-4 flex items-center gap-1 font-sans text-[11px] font-semibold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
        Continue reading <ArrowRight />
      </div>
    </button>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export function JournalPage() {
  const [showMore, setShowMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const openArticle = (article: Article) => setSelectedArticle(article);
  const closeArticle = () => setSelectedArticle(null);

  // Helpers to find articles by id
  const featured   = ALL_ARTICLES.find(a => a.id === "finding-stillness")!;
  const secondary  = ALL_ARTICLES.filter(a => ["nature-of-soul", "on-self-discipline"].includes(a.id));
  const gridLeft   = ALL_ARTICLES.find(a => a.id === "gunas-daily-life")!;
  const gridRight  = ALL_ARTICLES.find(a => a.id === "yoga-of-wisdom")!;
  const selflessAction = ALL_ARTICLES.find(a => a.id === "selfless-action")!;
  const pathOfDevotion = ALL_ARTICLES.find(a => a.id === "path-of-devotion")!;
  const extraArticles  = ALL_ARTICLES.filter(a =>
    ["dharma-modern-dilemma", "witnessing-restless-mind", "fear-of-failure",
     "three-paths", "food-sleep-consciousness", "letting-go"].includes(a.id)
  );

  const filtered = activeFilter === "All"
    ? extraArticles
    : extraArticles.filter(a => a.category === activeFilter);

  return (
    <div className="relative min-h-screen bg-white font-sans text-slate-800">
      <AppNav />

      <div className="pointer-events-none absolute left-[5%] top-36 h-56 w-56 rounded-full bg-teal-100/35 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute right-[10%] top-[28rem] h-48 w-48 rounded-full bg-violet-100/30 blur-3xl" aria-hidden />

      {selectedArticle && <ArticleModal article={selectedArticle} onClose={closeArticle} />}

      <div className="relative z-[1] mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">

        {/* ══ PAGE HEADER ══ */}
        <div className="mb-14">
          <span className="mb-3 inline-block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-teal-700">Campfire essays</span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-[2.75rem]">
            Journal &amp; reflections
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-[1.72] text-slate-600">
            Pieces that borrow the Gītā&rsquo;s rhythm—dramatic stakes, humane doubt—indexed so you skim before hopping into conversational chat or your own sutra-reading.
          </p>
          <div className="mt-6 h-0.5 w-28 bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 opacity-70" />
        </div>

        {/* ══ FEATURED + SIDE STACK ══ */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

          {/* Featured hero card */}
          <button onClick={() => openArticle(featured)}
            className="card group cursor-pointer rounded-[1.5rem] border-teal-200/70 bg-gradient-to-br from-white to-teal-50/50 p-7 text-left ring-1 ring-teal-100/80"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">{featured.date}</span>
              <span className="text-slate-300 text-[10px]">·</span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-teal-700">{featured.category}</span>
            </div>
            <h2 className="font-serif text-[22px] font-normal leading-snug text-slate-900 group-hover:text-teal-900 transition-colors sm:text-2xl">
              {featured.title}
            </h2>
            {featured.verse && (
              <div className="my-5 rounded-r-xl border-l-[3px] border-teal-400 bg-teal-50/50 px-4 py-3">
                <p className="font-serif text-[13px] italic text-slate-600">
                  &ldquo;{featured.verse.text}&rdquo; — {featured.verse.ref}
                </p>
              </div>
            )}
            <p className="font-sans text-[13px] leading-7 text-slate-600">
              {featured.body[0]}<span className="text-slate-400"> …</span>
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-sans text-[12px] font-semibold text-teal-700 group-hover:underline transition-colors">
                Read full insight <ArrowRight />
              </span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {featured.tags.map((t) => <Tag key={t} label={t} />)}
              </div>
            </div>
          </button>

          {/* Side stack */}
          <div className="flex flex-col gap-5">
            {secondary.map((a) => (
              <button key={a.id} onClick={() => openArticle(a)}
                className="card group cursor-pointer rounded-sm border-violet-100/80 bg-gradient-to-br from-white to-violet-50/40 p-5 text-left"
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">{a.date}</span>
                <h3 className="mt-2 font-serif text-[16px] font-normal leading-snug text-slate-900 group-hover:text-violet-900 transition-colors">
                  {a.title}
                </h3>
                <p className="mt-1.5 font-sans text-[12px] leading-5 text-slate-600">{a.summary}</p>
                {a.verse && (
                  <p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] font-medium text-violet-700">
                    <span className="inline-block h-px w-5 bg-violet-200" />
                    {a.verse.ref}
                  </p>
                )}
                <p className="mt-3 flex items-center gap-1 font-sans text-[11px] font-semibold text-violet-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read full insight <ArrowRight />
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ══ 3-BENTO ROW ══ */}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <button type="button" onClick={() => openArticle(gridLeft)}
            className="card group cursor-pointer rounded-sm border-sky-100/80 bg-gradient-to-br from-white to-sky-50/40 p-5 text-left"
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">{gridLeft.date}</span>
            <h3 className="mt-2 font-serif text-[16px] font-normal leading-snug text-slate-900 group-hover:text-sky-900 transition-colors">{gridLeft.title}</h3>
            <p className="mt-1.5 font-sans text-[12px] leading-6 text-slate-600">{gridLeft.summary}</p>
            <div className="mt-3 flex items-center gap-1 font-sans text-[11px] text-slate-500">
              <TagIcon type={gridLeft.category} /><span>{gridLeft.category}</span>
            </div>
            <p className="mt-3 flex items-center gap-1 font-sans text-[11px] font-semibold text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity">Open article <ArrowRight /></p>
          </button>

          <div className="relative overflow-hidden rounded-sm border border-indigo-200/80" style={{ minHeight: "200px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1560297971-f26c8ba85802?fm=jpg&q=80&w=600&auto=format&fit=crop"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ filter: "saturate(0.35) brightness(0.65)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-teal-900/50 to-teal-800/30" />
            <div className="relative flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
              <p className="font-serif text-[14px] italic leading-relaxed text-white/95">{QUOTE_CARD.quote}</p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85">{QUOTE_CARD.ref}</p>
            </div>
          </div>

          <button type="button" onClick={() => openArticle(gridRight)}
            className="card group cursor-pointer rounded-sm border-rose-100/80 bg-gradient-to-br from-white to-rose-50/40 p-5 text-left"
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">{gridRight.date}</span>
            <h3 className="mt-2 font-serif text-[16px] font-normal leading-snug text-slate-900 group-hover:text-rose-900 transition-colors">{gridRight.title}</h3>
            <p className="mt-1.5 font-sans text-[12px] leading-6 text-slate-600">{gridRight.summary}</p>
            <div className="mt-3 flex items-center gap-1 font-sans text-[11px] text-slate-500">
              <TagIcon type={gridRight.category} /><span>{gridRight.category}</span>
            </div>
            <p className="mt-3 flex items-center gap-1 font-sans text-[11px] font-semibold text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity">Open article <ArrowRight /></p>
          </button>
        </div>

        {/* ══ WEEKLY SUMMARY ROW ══ */}
        <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_300px]">
          <button type="button" onClick={() => openArticle(selflessAction)}
            className="card group cursor-pointer rounded-sm border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/40 p-7 text-left"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">{selflessAction.date}</span>
              <span className="text-slate-300 text-[10px]">·</span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-700">{selflessAction.category}</span>
            </div>
            <h3 className="font-serif text-[18px] font-normal leading-snug text-slate-900 group-hover:text-emerald-900 transition-colors">{selflessAction.title}</h3>
            {selflessAction.verse && (
              <div className="my-4 rounded-r-xl border-l-[3px] border-emerald-400 bg-emerald-50/50 px-4 py-3">
                <p className="font-serif text-[13px] italic text-slate-600">
                  &ldquo;{selflessAction.verse.text}&rdquo; — {selflessAction.verse.ref}
                </p>
              </div>
            )}
            <p className="font-sans text-[13px] leading-7 text-slate-600">{selflessAction.body[0]}</p>
            <span className="mt-4 flex items-center gap-1.5 font-sans text-[12px] font-semibold text-emerald-700 transition-colors">
              Continue reading <ArrowRight />
            </span>
          </button>

          <button type="button" onClick={() => openArticle(pathOfDevotion)}
            className="group flex cursor-pointer flex-col justify-between rounded-sm border border-dashed border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 p-6 text-left transition-colors hover:border-amber-300/80"
          >
            <div>
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-amber-700">{pathOfDevotion.category}</p>
              <h3 className="font-serif text-[18px] font-normal leading-snug text-slate-900 group-hover:text-amber-900 transition-colors">
                {pathOfDevotion.title}
              </h3>
              <p className="mt-3 font-sans text-[12px] leading-6 text-slate-600">{pathOfDevotion.summary}</p>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Related threads</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-amber-200 bg-white text-amber-700">
                <SparkleIcon />
              </span>
            </div>
          </button>
        </div>

        {/* ══ TOPICS GUIDE STRIP ══ */}
        <div className="mt-12">
          <span className="mb-3 inline-block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-indigo-700">Topical index</span>
          <div className="mb-6 h-0.5 w-full max-w-xs bg-gradient-to-r from-teal-400 via-indigo-400 to-violet-400 opacity-50" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { topic: "Karma Yoga",         desc: "Act without attachment. The philosophy of selfless action and duty.", verse: "Ch. 3 & 4", accent: "teal" },
              { topic: "Jnana Yoga",         desc: "The path of knowledge. Discrimination between the real and the unreal.", verse: "Ch. 4 & 13", accent: "indigo" },
              { topic: "Bhakti Yoga",        desc: "Pure devotion. How surrender and love dissolve the ego.", verse: "Ch. 12", accent: "violet" },
              { topic: "Dhyana Yoga",        desc: "The yoga of meditation. Stilling the mind to rest in the self.", verse: "Ch. 6", accent: "sky" },
              { topic: "Raja Yoga",          desc: "The royal path of self-discipline, pranayama, and concentration.", verse: "Ch. 6", accent: "rose" },
              { topic: "Sankhya Philosophy", desc: "The Gita's metaphysics — purusha, prakriti, and the three gunas.", verse: "Ch. 2 & 14", accent: "emerald" },
            ].map((t) => {
              const styles: Record<string, { card: string; label: string; hover: string; link: string }> = {
                teal:    { card: "border-teal-100/80 bg-gradient-to-br from-white to-teal-50/40", label: "text-teal-700", hover: "group-hover:text-teal-900", link: "text-teal-700" },
                indigo:  { card: "border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/40", label: "text-indigo-700", hover: "group-hover:text-indigo-900", link: "text-indigo-700" },
                violet:  { card: "border-violet-100/80 bg-gradient-to-br from-white to-violet-50/40", label: "text-violet-700", hover: "group-hover:text-violet-900", link: "text-violet-700" },
                sky:     { card: "border-sky-100/80 bg-gradient-to-br from-white to-sky-50/40", label: "text-sky-700", hover: "group-hover:text-sky-900", link: "text-sky-700" },
                rose:    { card: "border-rose-100/80 bg-gradient-to-br from-white to-rose-50/40", label: "text-rose-700", hover: "group-hover:text-rose-900", link: "text-rose-700" },
                emerald: { card: "border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/40", label: "text-emerald-700", hover: "group-hover:text-emerald-900", link: "text-emerald-700" },
              };
              const s = styles[t.accent];
              return (
              <Link key={t.topic} href="/chat"
                className={`card group rounded-sm p-5 transition-all ${s.card}`}
              >
                <p className={`mb-1 text-[0.65rem] font-semibold uppercase tracking-wider ${s.label}`}>{t.verse}</p>
                <h3 className={`font-serif text-[15px] font-normal text-slate-900 transition-colors ${s.hover}`}>{t.topic}</h3>
                <p className="mt-1.5 font-sans text-[12px] leading-5 text-slate-600">{t.desc}</p>
                <p className={`mt-3 flex items-center gap-1 font-sans text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${s.link}`}>
                  Open in chat <ArrowRight />
                </p>
              </Link>
              );
            })}
          </div>
        </div>

        {/* ══ EXTRA ARTICLES + FILTERS ══ */}
        <div className="mt-10">
          <div className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => { setActiveFilter(f); if (!showMore) setShowMore(true); }}
                className={`rounded-sm border px-4 py-1.5 font-sans text-[12px] font-semibold transition-all ${
                  activeFilter === f && showMore
                    ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {showMore && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(filtered.length > 0 ? filtered : extraArticles).map((a) => (
                <ArticleCard key={a.id} article={a} onOpen={openArticle} />
              ))}
            </div>
          )}
        </div>

        {/* ══ LOAD MORE ══ */}
        <div className="mt-12 flex justify-center">
          <button type="button" onClick={() => setShowMore((v) => !v)}
            className="btn-secondary rounded-sm px-8 py-3 font-sans text-[13px]"
          >
            {showMore ? "Show less" : "Load more articles"}
          </button>
        </div>

      </div>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="font-serif text-[13px] font-semibold text-slate-800">Bhagavad Gītā AI</p>
          <p className="text-center font-sans text-[11px] text-slate-500">© Bhagavad Gītā AI — verify passages against primary sources.</p>
          <div className="flex items-center gap-4 font-sans text-[12px] text-slate-600">
            <a href="#" className="transition-colors hover:text-indigo-700">Privacy</a>
            <a href="#" className="transition-colors hover:text-indigo-700">Terms</a>
            <Link href="/chat" className="font-medium text-teal-700 hover:underline">
              Chat
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
