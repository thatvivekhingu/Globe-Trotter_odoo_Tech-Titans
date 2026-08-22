import { useContext } from 'react'
import { TripWiseContext } from './TripWiseContext'

export function useTripWise() {
  const value = useContext(TripWiseContext)
  if (!value) throw new Error('useTripWise must be used within TripWiseProvider')
  return value
}
