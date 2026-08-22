/**
 * AI API client — Tier 1 features
 * Calls /api/v1/ai/* endpoints
 */
import { apiClient } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'adventure'
  | 'nature'
  | 'shopping'
  | 'culture'
  | 'entertainment'

export type TravelStyle = 'budget' | 'comfort' | 'luxury'

// 1. Itinerary Generator
export interface ItineraryRequest {
  destination: string
  start_date: string
  end_date: string
  budget?: number
  currency?: string
  interests?: ActivityCategory[]
  travel_style?: TravelStyle
}

export interface ItineraryActivity {
  time: string
  name: string
  category: ActivityCategory
  duration_minutes: number
  estimated_cost: number
  description: string
  tips?: string | null
}

export interface ItineraryDay {
  date: string
  theme: string
  activities: ItineraryActivity[]
  total_cost: number
  notes?: string | null
}

export interface ItineraryResponse {
  destination: string
  summary: string
  total_days: number
  total_estimated_cost: number
  currency: string
  days: ItineraryDay[]
  packing_tips: string[]
  best_time_to_visit: string
}

// 2. Chat
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message: string
  history?: ChatMessage[]
  trip_context?: Record<string, string | number | null>
}

export interface ChatResponse {
  reply: string
  suggestions: string[]
}

// 3. Budget Optimizer
export interface BudgetInsight {
  category: string
  status: 'on_track' | 'overspending' | 'underspending' | 'no_data'
  message: string
  saving_tip?: string | null
  suggested_adjustment?: number | null
}

export interface BudgetOptimizerResponse {
  overall_health: 'healthy' | 'warning' | 'critical'
  headline: string
  summary: string
  insights: BudgetInsight[]
  top_saving_opportunities: string[]
  reallocation_advice?: string | null
}

// 4. Discovery
export interface DiscoveryRequest {
  past_destinations?: string[]
  saved_destinations?: string[]
  budget_style?: 'low' | 'medium' | 'high'
  preferred_categories?: ActivityCategory[]
  exclude_destinations?: string[]
  count?: number
}

export interface DestinationRecommendation {
  city: string
  country: string
  reason: string
  highlights: string[]
  best_season: string
  estimated_daily_budget: string
  match_score: number
}

export interface DiscoveryResponse {
  recommendations: DestinationRecommendation[]
  personalization_summary: string
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function generateAiItinerary(payload: ItineraryRequest): Promise<ItineraryResponse> {
  const response = await apiClient.post<ItineraryResponse>('/ai/itinerary', payload, {
    timeout: 60000, // AI calls can take longer
  })
  return response.data
}

export async function chatWithGuide(payload: ChatRequest): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/ai/chat', payload, {
    timeout: 30000,
  })
  return response.data
}

export async function getAiBudgetInsights(tripId: number): Promise<BudgetOptimizerResponse> {
  const response = await apiClient.get<BudgetOptimizerResponse>(`/ai/budget/${tripId}`, {
    timeout: 30000,
  })
  return response.data
}

export async function getAiDestinations(payload: DiscoveryRequest): Promise<DiscoveryResponse> {
  const response = await apiClient.post<DiscoveryResponse>('/ai/discover', payload, {
    timeout: 30000,
  })
  return response.data
}
