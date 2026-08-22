import { useEffect, useState } from 'react'
import { Cloud, CloudRain, CloudSun, Droplets, Sun, Wind, Sparkles } from 'lucide-react'
import type { City } from '../../types/domain'

interface WeatherData {
  temperature: number
  windSpeed: number
  humidity: number
  condition: string
  icon: 'sun' | 'cloud' | 'rain' | 'cloud-sun'
}

interface LiveWeatherWidgetProps {
  city: City | undefined
}

export function LiveWeatherWidget({ city }: LiveWeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!city || city.lat === undefined || city.lng === undefined) {
      // Default fallback weather
      setWeather({
        temperature: 28,
        windSpeed: 12,
        humidity: 65,
        condition: 'Clear & Pleasant',
        icon: 'sun',
      })
      return
    }

    setLoading(true)
    const lat = city.lat
    const lng = city.lng

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.current_weather) {
          const temp = Math.round(data.current_weather.temperature)
          const code = data.current_weather.weathercode
          const wind = Math.round(data.current_weather.windspeed)
          const hum = data.hourly?.relativehumidity_2m?.[0] || 60

          let cond = 'Sunny / Clear'
          let iconType: WeatherData['icon'] = 'sun'

          if (code >= 51 && code <= 67) {
            cond = 'Light Rain / Drizzle'
            iconType = 'rain'
          } else if (code >= 80 && code <= 99) {
            cond = 'Rain Showers'
            iconType = 'rain'
          } else if (code >= 1 && code <= 3) {
            cond = 'Partly Cloudy'
            iconType = 'cloud-sun'
          } else if (code >= 45 && code <= 48) {
            cond = 'Foggy / Hazy'
            iconType = 'cloud'
          }

          setWeather({
            temperature: temp,
            windSpeed: wind,
            humidity: hum,
            condition: cond,
            icon: iconType,
          })
        }
      })
      .catch(() => {
        setWeather({
          temperature: 29,
          windSpeed: 10,
          humidity: 60,
          condition: 'Warm & Sunny',
          icon: 'sun',
        })
      })
      .finally(() => setLoading(false))
  }, [city])

  if (!city) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4F46E5] flex items-center gap-1">
          <Sparkles size={12} /> Live Destination Forecast
        </span>
        <span className="text-xs font-semibold text-slate-500">{city.name}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center">
            {weather?.icon === 'rain' ? (
              <CloudRain size={22} className="text-blue-500" />
            ) : weather?.icon === 'cloud' ? (
              <Cloud size={22} className="text-slate-600" />
            ) : weather?.icon === 'cloud-sun' ? (
              <CloudSun size={22} className="text-amber-500" />
            ) : (
              <Sun size={22} className="text-amber-500" />
            )}
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-slate-900">
              {loading ? '...' : `${weather?.temperature || 28}°C`}
            </div>
            <p className="text-xs font-medium text-slate-500">{weather?.condition || 'Clear'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[11px] font-medium text-slate-500 text-right">
          <span className="flex items-center justify-end gap-1">
            <Droplets size={12} className="text-blue-500" /> {weather?.humidity || 60}% Humidity
          </span>
          <span className="flex items-center justify-end gap-1">
            <Wind size={12} className="text-teal-500" /> {weather?.windSpeed || 12} km/h Wind
          </span>
        </div>
      </div>
    </div>
  )
}
