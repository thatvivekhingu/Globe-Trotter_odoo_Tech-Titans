import type { ReactNode } from 'react'
import { AuthProvider } from '../state/AuthProvider'
import { TripWiseProvider } from '../state/TripWiseProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <TripWiseProvider><AuthProvider>{children}</AuthProvider></TripWiseProvider>
}
