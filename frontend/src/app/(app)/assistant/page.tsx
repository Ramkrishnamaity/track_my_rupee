import type { Metadata } from "next"

import { BlockedSection } from "@/components/app/blocked-section"
import { AssistantChat } from "@/components/assistant/assistant-chat"

export const metadata: Metadata = { title: "AI Assistant" }

export default function AssistantPage() {
  // Not built yet (needs the AI feature): visible but unusable, with an "Under development" cursor label.
  return (
    <BlockedSection>
      <AssistantChat />
    </BlockedSection>
  )
}
