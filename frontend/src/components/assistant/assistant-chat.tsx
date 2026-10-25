"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, ChartPie, Lightbulb, Scale, Sparkles, SquarePen, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/components/app/user-provider"
import { firstName } from "@/lib/user"
import { cn } from "@/lib/utils"

type Message = {
  id: number
  role: "user" | "assistant"
  content: React.ReactNode
}

const SUGGESTED_QUESTIONS = [
  "Check my last month's expenses and give me suggestions",
  "How much salary was credited last month?",
  "Compare my spending this month vs last month",
  "Where can I cut down my spending?",
]

const suggestionIcons = [ChartPie, Wallet, Scale, Lightbulb]

/** Small gradient tile used as the assistant's avatar. */
function AssistantAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-from to-brand-to text-white shadow-sm shadow-primary/25",
        className
      )}
    >
      <Sparkles className="size-4" />
    </span>
  )
}

export function AssistantChat() {
  const user = useCurrentUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const nextId = useRef(0)
  const endRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, thinking])

  function ask(question: string) {
    const text = question.trim()
    if (!text || thinking) return
    setMessages((m) => [...m, { id: nextId.current++, role: "user", content: text }])
    setInput("")
    setThinking(true)
    // Design phase: fake a short delay, then a placeholder reply. The real assistant replaces this.
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          role: "assistant",
          content: "I'm still being built. Answers are coming soon!",
        },
      ])
      setThinking(false)
    }, 900)
  }

  function newChat() {
    setMessages([])
    setInput("")
  }

  const empty = messages.length === 0

  return (
    <div className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-3xl flex-col">
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <AssistantAvatar className="size-14 rounded-2xl [&_svg]:size-6" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Hi {firstName(user.name)}, how can I help?
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Ask anything about your money: your spending, income, budgets or how to save more.
          </p>

          <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
            {SUGGESTED_QUESTIONS.map((q, i) => {
              const Icon = suggestionIcons[i]
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="group flex items-start gap-3 rounded-2xl border bg-card p-4 text-left text-sm transition-colors outline-none hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="pt-1.5 font-medium">{q}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-6 py-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="rounded-full bg-card" onClick={newChat}>
              <SquarePen /> New chat
            </Button>
          </div>

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm whitespace-pre-wrap text-primary-foreground">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <AssistantAvatar />
                <div className="min-w-0 flex-1 pt-1 text-sm leading-relaxed">{m.content}</div>
              </div>
            )
          )}

          {thinking && (
            <div className="flex items-center gap-3" aria-live="polite">
              <AssistantAvatar />
              <span className="flex gap-1" aria-label="Assistant is typing">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* Composer, pinned to the bottom of the screen */}
      <div className="sticky bottom-0 bg-linear-to-t from-background via-background to-transparent pt-4 pb-1">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
          className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-lg shadow-primary/5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20"
        >
          <label htmlFor="assistant-input" className="sr-only">
            Ask the assistant
          </label>
          <textarea
            id="assistant-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter adds a new line.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                ask(input)
              }
            }}
            placeholder="Ask about your spending, income or budgets…"
            className="field-sizing-content max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            disabled={!input.trim() || thinking}
            aria-label="Send"
          >
            <ArrowUp />
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Answers are based on your TrackMyRupee data. AI can make mistakes, so check important numbers.
        </p>
      </div>
    </div>
  )
}
