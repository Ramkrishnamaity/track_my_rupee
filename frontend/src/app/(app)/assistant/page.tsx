import type { Metadata } from "next"

import { AssistantChat } from "@/components/assistant/assistant-chat"

export const metadata: Metadata = { title: "AI Assistant" }

export default function AssistantPage() {
  // Design phase: sample answers until the real AI assistant is built.

  return <AssistantChat />
}
