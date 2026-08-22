/**
 * GlobeGuideChat — AI travel chatbot floating panel
 * Accessible via a fixed button on any protected page.
 */
import { Bot, ChevronDown, Loader2, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { chatWithGuide } from '../../lib/api/aiApi'
import type { ChatMessage } from '../../lib/api/aiApi'
import { getApiErrorMessage } from '../../lib/api/client'

interface GlobeGuideChatProps {
  tripContext?: Record<string, string | number | null>
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm Globe Guide ✈️ — your AI travel companion. Ask me anything about destinations, itineraries, budgets, or local tips!",
}

const SUGGESTED_STARTERS = [
  'What are the must-see places in Rajasthan?',
  'How much does a week in Goa cost?',
  'Best time to visit Kerala?',
]

export function GlobeGuideChat({ tripContext }: GlobeGuideChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTED_STARTERS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMessage: ChatMessage = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const history = messages.filter((m) => m.role !== 'assistant' || m !== WELCOME_MESSAGE)
      const res = await chatWithGuide({
        message: text.trim(),
        history,
        trip_context: tripContext,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
      if (res.suggestions.length) setSuggestions(res.suggestions)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Globe Guide is unavailable. Check your GEMINI_API_KEY.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="globe-guide-trigger"
        aria-label={open ? 'Close Globe Guide chat' : 'Open Globe Guide AI chat'}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-ink text-parchment shadow-2xl transition-all duration-300 hover:bg-clay hover:scale-110 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2"
      >
        {open ? <ChevronDown size={22} /> : <Bot size={22} />}
      </button>

      {/* Chat panel */}
      <div
        id="globe-guide-panel"
        role="dialog"
        aria-label="Globe Guide AI chat"
        aria-modal="true"
        className={[
          'fixed bottom-24 right-6 z-50 flex w-[min(420px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-line bg-parchment shadow-2xl transition-all duration-300',
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none',
        ].join(' ')}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-line bg-ink px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-sage/30">
              <Sparkles size={15} className="text-sage" />
            </div>
            <div>
              <p className="text-sm font-semibold text-parchment">Globe Guide</p>
              <p className="text-[10px] text-parchment/50">AI Travel Assistant</p>
            </div>
          </div>
          <button
            aria-label="Close chat"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-parchment/60 hover:bg-parchment/10 hover:text-parchment"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={['flex', msg.role === 'user' ? 'justify-end' : 'justify-start'].join(' ')}
            >
              {msg.role === 'assistant' && (
                <div className="mr-2 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-sage/20">
                  <Bot size={12} className="text-ink" />
                </div>
              )}
              <div
                className={[
                  'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-ink text-parchment rounded-tr-sm'
                    : 'bg-white border border-line text-ink rounded-tl-sm',
                ].join(' ')}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sage/20">
                <Bot size={12} className="text-ink" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-white px-3.5 py-2.5">
                <Loader2 size={14} className="animate-spin text-ink/50" />
                <span className="text-xs text-ink/50">Thinking…</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-clay/30 bg-clay/5 px-3 py-2 text-xs text-clay">
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !loading && (
          <div className="border-t border-line px-4 py-2">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { void sendMessage(s) }}
                  className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink/70 hover:border-ink hover:text-ink transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          className="flex items-center gap-2 border-t border-line bg-white px-3 py-2.5"
          onSubmit={(e) => { e.preventDefault(); void sendMessage(input) }}
        >
          <input
            ref={inputRef}
            id="globe-guide-input"
            type="text"
            placeholder="Ask anything about travel…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-ink placeholder-ink/35 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="flex size-8 items-center justify-center rounded-full bg-ink text-parchment transition-all hover:bg-clay disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </>
  )
}
