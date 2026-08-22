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

  function generateSmartAiResponse(prompt: string): string {
    const p = prompt.toLowerCase()

    if (p.includes('hey') || p.includes('hello') || p.includes('hi') || p.includes('namaste')) {
      return `Namaste Priyanka! 🌟 I'm your GlobeTrotter AI Travel Copilot. 

How can I assist your travel plans today? 
• 🏖️ Plan a vibrant beach trip to **Goa** (Scuba, Mandovi cruise, beach shacks)
• ❄️ Snow & Gondola adventure in **Gulmarg & Kashmir**
• 🏔️ Paragliding & mountain cafes in **Manali & Kasol**
• 🌴 Houseboats & tea hills in **Kerala Backwaters**
• ✈️ Check live flight deals & 5-star hotel options

Feel free to ask me anything in English or Hindi!`
    }

    if (p.includes('goa')) {
      return `🌴 **Top Recommendations for Goa Trip (4D/3N):**
1. **Day 1:** Check in at Candolim/Baga, sunset drinks at Britto's & evening Mandovi River Luxury Cruise.
2. **Day 2:** Grand Island PADI Scuba Diving & dolphin safari, followed by Tito's Lane nightlife.
3. **Day 3:** 4x4 Jeep Safari to Dudhsagar Waterfalls & Goan spice plantation buffet lunch.
4. **Day 4:** South Goa peaceful Palolem beach & authentic fish thali at Martin's Corner before flight.

💡 *Estimated Budget:* ₹15,000 - ₹25,000 per person including stays and activities.`
    }

    if (p.includes('kashmir') || p.includes('gulmarg') || p.includes('srinagar')) {
      return `❄️ **Kashmir Heaven on Earth Itinerary (5D/4N):**
1. **Srinagar:** Sunset Shikara ride on Dal Lake & stay in a luxury carved wooden houseboat.
2. **Gulmarg:** Take the Phase 2 Gondola up to Apharwat Peak (13,780 ft) for skiing and snow views.
3. **Pahalgam:** Horseback trail through Betaab Valley & pine forests along the Lidder River.
4. **Food:** Must-try 7-course Kashmiri Wazwan (Rogan Josh, Gushtaba) and hot Kahwa!

💡 *Best Season:* Dec-Feb for snowfall & skiing, April-June for lush green tulip valleys.`
    }

    if (p.includes('manali') || p.includes('kasol') || p.includes('himachal')) {
      return `🏔️ **Manali & Kasol Himalayan Escape (5D/4N):**
• **Solang Valley:** Tandem high-fly paragliding & snow quad rides.
• **Atal Tunnel:** Drive to Sissu waterfall and Lahaul snow point.
• **Kasol & Chalal:** Parvati river cafe trail with authentic Israeli food & bonfire nights.
• **Manikaran:** Natural sulfur hot springs & holy langar.

💡 *Pro Tip:* Book early morning paragliding slots for clearer mountain skies!`
    }

    if (p.includes('dubai')) {
      return `🏙️ **Dubai Grand Vacation Highlights (5D/4N):**
1. **Burj Khalifa:** Fast-track 124th & 125th floor observation deck at golden hour.
2. **Desert Safari:** 4x4 Red Dunes bashing, camel rides, sandboarding & live BBQ buffet.
3. **Dubai Marina:** Sunset luxury yacht cruise with skyline views.
4. **Abu Dhabi Day Tour:** Sheikh Zayed Grand Mosque & Ferrari World.

💡 *Flight Tip:* Direct flights via IndiGo (6E) & Emirates from Mumbai/Delhi take just ~3.5 hours.`
    }

    if (p.includes('budget') || p.includes('cost') || p.includes('paisa') || p.includes('kharcha')) {
      return `💰 **Smart Travel Budget Estimator:**
• **Budget / Backpacker:** ₹2,500 - ₹3,500 / day (Hostels/Zostel, sleeper transit, local cafes)
• **Comfort / Couples:** ₹5,500 - ₹8,500 / day (3-4 Star hotels, AC cabs, guided tours)
• **Luxury / Family:** ₹15,000+ / day (5-Star Taj/Oberoi resorts, private chauffeur, fine dining)

You can manage, track and split all expenses under our **Budget & Split** tab!`
    }

    return `🌍 **GlobeTrotter AI Advice:**
I'd love to help you plan that! You can explore our pre-curated **MakeMyTrip Holiday Packages** in the *Curated Tours* tab, check real-time flights & hotels in *Bookings*, or tell me your preferred destination, travel dates, and budget to generate a custom day-wise itinerary!`
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
    const groqKey = localStorage.getItem('GLOBETROTTER_GROQ_KEY') || import.meta.env.VITE_GROQ_API_KEY || ''
    let selectedModel = localStorage.getItem('GLOBETROTTER_AI_MODEL') || 'llama-3.3-70b-versatile'
    if (selectedModel === 'openai/gpt-oss-120b' || selectedModel === 'llama-3.3-70b') selectedModel = 'llama-3.3-70b-versatile'

    if (groqKey && selectedModel !== 'local-engine') {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: 'system',
                content: 'You are GlobeTrotter AI Copilot, an expert Indian & global travel architect. Provide deeply helpful, authentic, practical travel advice with specific recommendations, timings, and estimated costs in ₹ INR.',
              },
              { role: 'user', content: query },
            ],
          }),
        })
        const data = await response.json()
        const aiText = data?.choices?.[0]?.message?.content
        if (aiText) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: aiText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ])
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn('Groq LLaMA API call failed, falling back to smart reply:', err)
      }
    }

    // Intelligent in-browser fallback AI travel response
    await new Promise((resolve) => setTimeout(resolve, 400))
    const fallbackReply = generateSmartAiResponse(query)
    setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: fallbackReply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setLoading(false)
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
