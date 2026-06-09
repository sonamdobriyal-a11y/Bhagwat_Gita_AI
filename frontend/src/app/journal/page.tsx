import type { Metadata } from "next";
import { JournalPage } from "@/components/JournalPage";

export const metadata: Metadata = {
  title: "Journal & Reflections",
  description:
    "A digital manuscript of your spiritual journey through the Bhagavad Gita. Curated reflections, essays and wisdom on karma, dharma, self-mastery and equanimity.",
};

export default function Journal() {
  return <JournalPage />;
}
