import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { City, TripStop } from '../../types/domain'

interface TripMapViewProps {
  stops: TripStop[]
  cities: City[]
  selectedStopId?: string
  onSelectStop?: (stopId: string) => void
  height?: string
}

export function TripMapView({ stops, cities, selectedStopId, onSelectStop, height = '320px' }: TripMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Fix default marker icons in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Clean, modern CartoDB Positron tiles matching the light aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      const layerGroup = L.layerGroup().addTo(map)
      layerGroupRef.current = layerGroup
      mapInstanceRef.current = map
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()

    const sortedStops = [...stops].sort((a, b) => a.order - b.order)
    const latLngs: L.LatLngExpression[] = []

    sortedStops.forEach((stop, index) => {
      const city = cities.find((c) => c.id === stop.cityId)
      if (!city || city.lat === undefined || city.lng === undefined) return

      const pos: [number, number] = [city.lat, city.lng]
      latLngs.push(pos)

      const isSelected = stop.id === selectedStopId

      // Custom SVG Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: ${isSelected ? '#4F46E5' : '#0F172A'};
            color: #FFFFFF;
            border-radius: 50%;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker(pos, { icon: customIcon }).addTo(layerGroup)

      const popupContent = `
        <div style="font-family: inherit; padding: 4px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #0F172A;">${city.name}</h4>
          <p style="margin: 2px 0 0; font-size: 11px; color: #64748B;">Stop ${index + 1} &bull; ${city.region}</p>
        </div>
      `
      marker.bindPopup(popupContent)

      marker.on('click', () => {
        if (onSelectStop) onSelectStop(stop.id)
      })
    })

    // Draw route polyline
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#4F46E5',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
      }).addTo(layerGroup)
    }

    // Auto-fit bounds
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
    }
  }, [stops, cities, selectedStopId, onSelectStop])

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="size-full" />
    </div>
  )
}
