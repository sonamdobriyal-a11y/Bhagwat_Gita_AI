import type { Metadata } from "next";
import { StoriesPage } from "@/components/StoriesPage";

export const metadata: Metadata = {
  title: "Stories of Female Characters",
  description:
    "Read the stories of Shikhandi, Draupadi, Kunti, and other women whose lives shaped the Mahabharata and the Gita.",
};

export default function Stories() {
  return <StoriesPage />;
}
