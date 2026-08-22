
export function GlobeTrotterEmblem({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 drop-shadow-md"
    >
      <defs>
        <linearGradient id="gtBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="50%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="gtOrbitalGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        <linearGradient id="gtJetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#B4F056" />
        </linearGradient>

        <filter id="gtGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded squircle background */}
      <rect width="48" height="48" rx="14" fill="url(#gtBgGrad)" stroke="#334155" strokeWidth="1" />

      {/* Subtle globe grid lines */}
      <circle cx="24" cy="24" r="16" stroke="#334155" strokeWidth="1.2" strokeDasharray="2 2" fill="none" opacity="0.6" />
      <ellipse cx="24" cy="24" rx="8" ry="16" stroke="#475569" strokeWidth="1" fill="none" opacity="0.5" />
      <line x1="8" y1="24" x2="40" y2="24" stroke="#475569" strokeWidth="1" opacity="0.5" />

      {/* Dynamic orbital swoosh path */}
      <path
        d="M 10 32 C 14 16, 32 12, 38 20 C 42 26, 30 38, 16 34"
        stroke="url(#gtOrbitalGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#gtGlow)"
      />

      {/* Supersonic Jet taking off in flight */}
      <g transform="translate(24, 18) rotate(35) scale(0.95)">
        <path
          d="M 0 -10 L 4 2 L 10 5 L 4 6 L 3 10 L 0 8 L -3 10 L -4 6 L -10 5 L -4 2 Z"
          fill="url(#gtJetGrad)"
          filter="url(#gtGlow)"
        />
      </g>

      {/* Pulsing beacon dot at departure point */}
      <circle cx="12" cy="31" r="2" fill="#B4F056" />
      <circle cx="12" cy="31" r="3.5" stroke="#B4F056" strokeWidth="0.8" fill="none" opacity="0.7" className="animate-ping origin-center" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  size?: number
  showText?: boolean
  showBadge?: boolean
  dark?: boolean
}

export function GlobeTrotterLogo({
  className = '',
  size = 38,
  showText = true,
  showBadge = true,
  dark = false,
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <GlobeTrotterEmblem size={size} />

      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`font-display text-xl font-extrabold tracking-tight leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>
            Globe<span className="bg-gradient-to-r from-[#818CF8] via-[#A78BFA] to-[#38BDF8] bg-clip-text text-transparent">Trotter</span>
          </span>
          {showBadge && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs">
              PRO
            </span>
          )}
        </div>
      )}
    </div>
  )
}
