import { Compass } from 'lucide-react'

export function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-6">
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-ink text-parchment"><Compass size={22} className="animate-pulse" aria-hidden="true" /></div>
        <p className="mt-4 font-display text-2xl text-ink">Checking your travel journal…</p>
        <p className="mt-2 text-sm text-ink/55">One moment.</p>
      </div>
    </main>
  )
}
