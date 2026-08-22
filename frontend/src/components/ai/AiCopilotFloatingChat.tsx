import { useState, useRef, useEffect } from 'react'
import { Bot, Mic, MicOff, Minimize2, Send, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { apiClient, getApiErrorMessage } from '../../lib/api/client'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
}

const initialMessages: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: 'Hello! I am your GlobeTrotter AI Travel Copilot 🧭. You can type or tap the microphone 🎙️ to speak in Hindi or English!',
    timestamp: 'Just now',
  },
]

export function AiCopilotFloatingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) scrollToBottom()
  }, [messages, open])

  function startVoiceRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser. Try Chrome/Edge.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    setListening(true)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setListening(false)
      void handleSend(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  function speakText(id: string, text: string) {
    if (!window.speechSynthesis) return
    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }
    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*_#•-]/g, ' ')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.02
    utterance.pitch = 1.0
    utterance.onend = () => setSpeakingId(null)
    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await apiClient.post<{ reply: string }>('/ai/chat', { message: query })
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: response.data.reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } catch (error) {
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: getApiErrorMessage(error, 'The copilot is unavailable. Please check that the TripWise API is running.'), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group relative flex items-center gap-2.5 px-5 py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full shadow-2xl transition-all duration-300 active:scale-95 border border-slate-700 hover:shadow-indigo-500/20"
        >
          <div className="size-6 rounded-full bg-[#B4F056] text-[#0F172A] flex items-center justify-center font-bold text-xs">
            <Sparkles size={14} />
          </div>
          <span className="font-bold text-xs tracking-wide">AI Travel Copilot</span>
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-[#10B981] animate-ping" />
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-[#10B981]" />
        </button>
      )}

      {/* Expanded Chat Window */}
      {open && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-[#0F172A] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-[#B4F056] text-[#0F172A] flex items-center justify-center shadow-xs">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm leading-tight flex items-center gap-1.5">
                  GlobeTrotter Copilot
                  <span className="text-[10px] bg-[#10B981]/20 text-[#B4F056] px-1.5 py-0.2 rounded-full font-bold">Online</span>
                </h4>
                <p className="text-[11px] text-slate-400">Powered by Gemini 1.5 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAFC]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="size-7 rounded-full bg-[#0F172A] text-[#B4F056] flex items-center justify-center shrink-0 text-xs">
                    <Sparkles size={12} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#4F46E5] text-white rounded-br-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <div className="flex items-center justify-between mt-1 pt-1">
                    {m.sender === 'ai' && (
                      <button
                        type="button"
                        onClick={() => speakText(m.id, m.text)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4F46E5] hover:text-indigo-800 transition-colors"
                      >
                        {speakingId === m.id ? (
                          <>
                            <VolumeX size={12} className="text-red-500" />
                            <span className="text-red-500">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                    <span
                      className={`text-[9px] ${
                        m.sender === 'user' ? 'text-indigo-200 ml-auto' : 'text-slate-400 ml-auto'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="size-2 rounded-full bg-[#4F46E5] animate-bounce" />
                <div className="size-2 rounded-full bg-[#4F46E5] animate-bounce [animation-delay:0.2s]" />
                <div className="size-2 rounded-full bg-[#4F46E5] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1">Groq LLaMA thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[10px] hide-scrollbar">
            <button
              onClick={() => handleSend('Best food in Goa?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              🍤 Best food in Goa?
            </button>
            <button
              onClick={() => handleSend('How to save budget?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              💰 Save travel budget?
            </button>
            <button
              onClick={() => handleSend('Manali packing tips')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              ❄️ Manali packing tips
            </button>
          </div>

          {/* Input Form with Voice Mic */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={startVoiceRecognition}
              title="Voice Input (Speech-to-Text)"
              className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                listening
                  ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400'
                  : 'bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100'
              }`}
            >
              {listening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? 'Listening to your voice...' : 'Type or speak your question...'}
              className="flex-1 px-3.5 py-2.5 rounded-full bg-slate-100 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="size-9 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-xs"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
