import { createInitialDb } from '../../mock/data'
import type { City, TripWiseDb } from '../../types/domain'

export interface CitySearchParams {
  query?: string
  country?: string
  region?: string
}

export interface ActivitySearchParams {
  query?: string
  cityId?: string
  category?: string
}

export const mockApi = {
  async getDb(): Promise<TripWiseDb> {
    return createInitialDb()
  },
  async searchCities(params: CitySearchParams = {}): Promise<City[]> {
    const db = createInitialDb()
    const query = params.query?.trim().toLowerCase() || ''
    return db.cities.filter((city) => {
      const matchesQuery = !query || `${city.name} ${city.country} ${city.region}`.toLowerCase().includes(query)
      const matchesCountry = !params.country || city.country === params.country
      const matchesRegion = !params.region || city.region === params.region
      return matchesQuery && matchesCountry && matchesRegion
    })
  },
  async searchActivities(params: ActivitySearchParams = {}) {
    const db = createInitialDb()
    const query = params.query?.trim().toLowerCase() || ''
    return db.activities.filter((activity) => {
      const matchesQuery = !query || `${activity.name} ${activity.description}`.toLowerCase().includes(query)
      const matchesCity = !params.cityId || activity.cityId === params.cityId
      const matchesCategory = !params.category || activity.category === params.category
      return matchesQuery && matchesCity && matchesCategory
    })
  },
}
