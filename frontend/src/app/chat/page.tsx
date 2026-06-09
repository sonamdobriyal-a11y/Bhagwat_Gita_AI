import type { Metadata } from "next";
import { ChatExperience } from "@/components/ChatExperience";

export const metadata: Metadata = {
  title: "Chat — Bhagavad Gita AI",
  description: "Ask your question. Get calm, grounded guidance from the Bhagavad Gita.",
};

export default function ChatPage() {
  return <ChatExperience />;
}
