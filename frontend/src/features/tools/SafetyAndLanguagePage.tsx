import { useState } from 'react'
import { AlertTriangle, CheckCircle, HeartHandshake, PhoneCall, Shield, Volume2 } from 'lucide-react'
import { Card, SectionHeading } from '../../components/ui/Card'

interface SafetyGuide {
  city: string
  region: string
  safetyScore: number
  riskLevel: 'Low' | 'Moderate'
  scamAlerts: string[]
  tips: string[]
}

interface PhraseItem {
  english: string
  hindi: string
  phonetic: string
  localLanguage: string
  localTranslation: string
  usage: string
}

const SAFETY_GUIDES: SafetyGuide[] = [
  {
    city: 'Goa',
    region: 'Konkan Coast',
    safetyScore: 95,
    riskLevel: 'Low',
    scamAlerts: [
      'Unmetered airport taxis: Always use Goa Miles app or prepaid police counter.',
      'Water sports touts: Book only with operators carrying valid GTDC badges & lifejackets.',
    ],
    tips: [
      'Avoid swimming near red flags during high tide currents.',
      'Keep your two-wheeler rental helmet strapped at all times (heavy traffic fines).',
    ],
  },
  {
    city: 'Jaipur',
    region: 'Rajasthan',
    safetyScore: 92,
    riskLevel: 'Low',
    scamAlerts: [
      'Gemstone export commission scam: Never purchase stones to "courier and resell abroad".',
      'Unofficial guides outside Amber Fort: Hire only licensed ASI badge guides at the ticket window.',
    ],
    tips: [
      'Agree on auto-rickshaw fare before boarding or use Uber/Ola auto.',
      'Dress modestly covering shoulders and knees when entering temple courtyards.',
    ],
  },
  {
    city: 'Manali & Himalayas',
    region: 'Himachal Pradesh',
    safetyScore: 98,
    riskLevel: 'Low',
    scamAlerts: [
      'Overpriced snow dress rentals: Rent directly at government registered shops near Solang.',
      'Unlicensed river rafting agents: Verify safety certificates before boarding rafts.',
    ],
    tips: [
      'Acclimatize for 24 hours before ascending to Rohtang Pass or Atal Tunnel.',
      'Carry motion sickness pills for winding hillside mountain roads.',
    ],
  },
  {
    city: 'Varanasi',
    region: 'Uttar Pradesh',
    safetyScore: 91,
    riskLevel: 'Low',
    scamAlerts: [
      'Boat ride price inflation at Ghats: Government fixed boat rates apply (₹200-₹400/person).',
      'Fake silk factory middlemen: Shop directly at certified weavers handloom cooperatives.',
    ],
    tips: [
      'Photography is strictly prohibited at Manikarnika and Harishchandra cremation ghats.',
      'Watch out for slippery stone steps during early morning boat departures.',
    ],
  },
]

const REGIONAL_PHRASES: Record<string, PhraseItem[]> = {
  hindi: [
    { english: 'Hello / Greetings', hindi: 'नमस्ते', phonetic: 'Namaste', localLanguage: 'Hindi', localTranslation: 'नमस्ते', usage: 'Universal polite greeting' },
    { english: 'How much does this cost?', hindi: 'यह कितने का है?', phonetic: 'Yeh kitne ka hai?', localLanguage: 'Hindi', localTranslation: 'यह कितने का है?', usage: 'Bazaar shopping & autos' },
    { english: 'Please use the meter.', hindi: 'मीटर से चलिए।', phonetic: 'Meter se chaliye.', localLanguage: 'Hindi', localTranslation: 'मीटर से चलिए।', usage: 'Taxi / Rickshaw rides' },
    { english: 'Where is the nearest hospital?', hindi: 'पास का अस्पताल कहाँ है?', phonetic: 'Paas ka aspatal kahan hai?', localLanguage: 'Hindi', localTranslation: 'अस्पताल कहाँ है?', usage: 'Emergency' },
    { english: 'Thank you very much!', hindi: 'बहुत बहुत धन्यवाद!', phonetic: 'Bahut bahut dhanyavaad!', localLanguage: 'Hindi', localTranslation: 'धन्यवाद', usage: 'Polite expression' },
  ],
  marathi_konkani: [
    { english: 'Hello', hindi: 'नमस्कार', phonetic: 'Namaskar / Deu boro dis dium', localLanguage: 'Konkani / Marathi', localTranslation: 'देव बरे दीस दींव', usage: 'Coastal greeting' },
    { english: 'How much is the fish / meal?', hindi: 'जेवण कितीला?', phonetic: 'Jevon kitlak?', localLanguage: 'Konkani', localTranslation: 'जेवण कितल्याक?', usage: 'Beach shacks & cafes' },
    { english: 'Where is the beach?', hindi: 'समुद्रकिनारा कुठे आहे?', phonetic: 'Vellu khoi asa?', localLanguage: 'Konkani', localTranslation: 'वेळू खंय आसा?', usage: 'Finding shore' },
    { english: 'Thank you', hindi: 'धन्यवाद', phonetic: 'Dev borem korum', localLanguage: 'Konkani', localTranslation: 'देव बरें करूं', usage: 'Gratitude' },
  ],
  rajasthani: [
    { english: 'Welcome / Greetings', hindi: 'पधारो म्हारे देस', phonetic: 'Padharo mhare des', localLanguage: 'Rajasthani', localTranslation: 'खम्मा घणी (Khamma Ghani)', usage: 'Traditional royal welcome' },
    { english: 'Very delicious food!', hindi: 'बहुत स्वादिष्ट!', phonetic: 'Ghanu swadisht chhe!', localLanguage: 'Rajasthani', localTranslation: 'घणो सोखनो!', usage: 'Appreciating Dal Baati' },
    { english: 'Which way to the palace?', hindi: 'महल किस तरफ है?', phonetic: 'Mahal kidhar chhe?', localLanguage: 'Rajasthani', localTranslation: 'महल काईं तरफ है?', usage: 'Heritage walks' },
  ],
  south_indian: [
    { english: 'Hello', hindi: 'வணக்கம் / നമസ്കാരം', phonetic: 'Vanakkam (Tamil) / Namaskaram (Malayalam)', localLanguage: 'Tamil / Malayalam', localTranslation: 'வணக்கம்', usage: 'Polite greeting' },
    { english: 'How much?', hindi: 'எவ்வளவு?', phonetic: 'Evvalavu? (Tamil) / Ethraya? (Malayalam)', localLanguage: 'Tamil / Malayalam', localTranslation: 'എത്രയാ?', usage: 'Markets & autos' },
    { english: 'Delicious!', hindi: 'ரொம்ப நல்லா இருக்கு', phonetic: 'Romba nalla irukku / Nalla ruchi', localLanguage: 'Tamil / Malayalam', localTranslation: 'നല്ല രുചി', usage: 'Appreciating filter coffee & dosas' },
    { english: 'Thank you', hindi: 'நன்றி / നന്ദി', phonetic: 'Nandri / Nandi', localLanguage: 'Tamil / Malayalam', localTranslation: 'நன்றி', usage: 'Gratitude' },
  ],
}

export function SafetyAndLanguagePage() {
  const [selectedLang, setSelectedLang] = useState<string>('hindi')
  const [speakingText, setSpeakingText] = useState<string | null>(null)

  function speakPhrase(text: string) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.lang = 'hi-IN'
    utterance.onend = () => setSpeakingText(null)
    setSpeakingText(text)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="space-y-9">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Shield size={13} className="text-emerald-600" /> 24/7 Traveler Protection Suite
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Safety Advisory & Local Phrasebook
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl">
          Verified regional scam warnings, city safety ratings, and interactive audio pronunciations across Indian languages.
        </p>
      </div>

      {/* Emergency SOS Numbers Card */}
      <Card className="p-6 bg-linear-to-r from-[#0F172A] to-slate-900 text-white rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#B4F056] text-xs font-bold uppercase tracking-wider">
              <PhoneCall size={15} /> Instant Emergency Dialers
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Need Urgent Help on the Road?</h3>
            <p className="text-xs text-slate-300">Toll-free 24/7 national tourist helplines with multi-lingual support.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="tel:112"
              className="px-4 py-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-white text-xs font-bold flex items-center gap-2 hover:bg-red-500/30 transition-all"
            >
              <PhoneCall size={14} className="text-red-400" />
              112 (National Emergency)
            </a>
            <a
              href="tel:1363"
              className="px-4 py-2.5 rounded-2xl bg-[#4F46E5]/20 border border-indigo-400/40 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-500/30 transition-all"
            >
              <Shield size={14} className="text-indigo-300" />
              1363 (Tourist Helpline)
            </a>
            <a
              href="tel:1091"
              className="px-4 py-2.5 rounded-2xl bg-pink-500/20 border border-pink-400/40 text-white text-xs font-bold flex items-center gap-2 hover:bg-pink-500/30 transition-all"
            >
              <HeartHandshake size={14} className="text-pink-300" />
              1091 (Women Safety)
            </a>
          </div>
        </div>
      </Card>

      {/* City-by-City Safety Scores & Scam Warnings */}
      <div className="space-y-4">
        <SectionHeading
          eyebrow="City Watch"
          title="Tourist Safety & Scam Advisory"
          description="Verified tourist safety scores, common traps to avoid, and local security tips."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {SAFETY_GUIDES.map((guide) => (
            <Card key={guide.city} className="p-5 border border-slate-200/80 rounded-2xl bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{guide.city}</h3>
                  <p className="text-xs text-slate-500">{guide.region}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle size={12} className="text-emerald-600" />
                    {guide.safetyScore}/100 Safe
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{guide.riskLevel} Risk Index</p>
                </div>
              </div>

              {/* Scam Warnings */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <AlertTriangle size={13} /> Common Tourist Traps to Avoid:
                </p>
                <ul className="space-y-1 pl-1 text-[11px] text-slate-600">
                  {guide.scamAlerts.map((scam, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{scam}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practical Tips */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Local Pro Tips:
                </p>
                <ul className="space-y-1 pl-1 text-[11px] text-slate-600">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Audio Phrasebook */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <SectionHeading
              eyebrow="Speak Like a Local"
              title="Interactive Audio Regional Phrasebook"
              description="Tap the speaker icon 🔊 to hear real native pronunciation."
            />
          </div>

          {/* Language Switcher Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setSelectedLang('hindi')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLang === 'hindi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Hindi (All India)
            </button>
            <button
              onClick={() => setSelectedLang('marathi_konkani')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLang === 'marathi_konkani' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Goa / Konkani & Marathi
            </button>
            <button
              onClick={() => setSelectedLang('rajasthani')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLang === 'rajasthani' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Rajasthani
            </button>
            <button
              onClick={() => setSelectedLang('south_indian')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLang === 'south_indian' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              South India (Tamil/Malayalam)
            </button>
          </div>
        </div>

        {/* Phrases Grid */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {(REGIONAL_PHRASES[selectedLang] || REGIONAL_PHRASES.hindi).map((p, idx) => (
            <Card
              key={idx}
              className="p-4 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all rounded-2xl bg-white space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {p.usage}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakPhrase(p.phonetic)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-[#4F46E5] text-slate-600 hover:text-white transition-all shadow-2xs"
                    title="Play Audio Pronunciation"
                  >
                    <Volume2 size={15} className={speakingText === p.phonetic ? 'animate-pulse text-indigo-600' : ''} />
                  </button>
                </div>

                <h4 className="font-display text-base font-bold text-slate-900 mt-2">{p.english}</h4>
                <p className="font-display text-xl font-bold text-[#4F46E5] mt-1">{p.localTranslation}</p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">"{p.phonetic}"</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                <span>{p.localLanguage}</span>
                <span>Tap 🔊 to pronounce</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
