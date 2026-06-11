import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bhagavad Gita AI — ancient wisdom made accessible for modern decisions. Learn about the platform and its creator.",
};

export default function About() {
  return <AboutPage />;
}
