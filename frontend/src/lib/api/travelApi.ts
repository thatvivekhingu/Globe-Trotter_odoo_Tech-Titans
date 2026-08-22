import { apiClient } from './client'

export interface RecommendationRequest {
  starting_city: string
  days: number
  budget: number
  travel_style: string
  interests: string[]
  destination_type: string
}

export interface RecommendationResponse {
  tripName: string
  summary: string
  suggestedCities: string[]
  budgetBreakdown: Record<string, number>
  days: Array<{
    dayNumber: number
    city: string
    theme: string
    activities: Array<{ name: string; category: string; time: string; cost: number; duration: string }>
  }>
  proTips: string[]
}

export async function generateRecommendation(payload: RecommendationRequest) {
  const response = await apiClient.post<RecommendationResponse>('/ai/recommendations', payload)
  return response.data
}
