import { jsPDF } from 'jspdf'
import type { Activity, City, Trip, TripActivity, TripStop } from '../types/domain'
import { formatCurrency, formatCategoryLabel } from './formatters'

/**
 * Generates and triggers download of an iCalendar (.ics) file
 * compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.
 */
export function downloadIcsFile(
  trip: Trip,
  tripActivities: TripActivity[],
  activities: Activity[],
  cities: City[],
  stops: TripStop[]
) {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GlobeTrotter//Travel Itinerary//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:GlobeTrotter - ${trip.name}`,
  ]

  tripActivities.forEach((ta) => {
    const act = activities.find((a) => a.id === ta.activityId)
    const stop = stops.find((s) => s.id === ta.stopId)
    const city = cities.find((c) => c.id === stop?.cityId)

    const dateStr = ta.date.replace(/-/g, '')
    const startHour = (ta.startTime || '10:00').replace(':', '') + '00'
    const durationMins = ta.durationMinutes || 120
    const endMinutesTotal = (parseInt(ta.startTime?.slice(0, 2) || '10', 10) * 60) + parseInt(ta.startTime?.slice(3, 5) || '00', 10) + durationMins
    const endHour = String(Math.floor(endMinutesTotal / 60) % 24).padStart(2, '0') + String(endMinutesTotal % 60).padStart(2, '0') + '00'

    const dtStart = `${dateStr}T${startHour}`
    const dtEnd = `${dateStr}T${endHour}`

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${ta.id}@globetrotter.app`,
      `DTSTAMP:${dateStr}T000000Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${act?.name || 'Travel Activity'}`,
      `LOCATION:${city?.name || ''}, ${city?.region || ''}`,
      `DESCRIPTION:Category: ${formatCategoryLabel(act?.category || 'sightseeing')} | Estimated Cost: ${formatCurrency(ta.estimatedCost || 0)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    )
  })

  icsContent.push('END:VCALENDAR')

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.setAttribute('download', `${trip.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-itinerary.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generates an elegant PDF document summary of the travel itinerary
 */
export function downloadPdfItinerary(
  trip: Trip,
  stops: TripStop[],
  tripActivities: TripActivity[],
  activities: Activity[],
  cities: City[],
  totalBudget: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Header Banner
  doc.setFillColor(15, 23, 42) // Slate 900
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(180, 240, 86) // Lime Green
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('GLOBETROTTER TRAVEL ITINERARY', 15, 14)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(trip.name, 15, 25)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(203, 213, 225)
  doc.text(`Dates: ${trip.startDate} to ${trip.endDate}   |   Estimated Budget: ${formatCurrency(totalBudget)}`, 15, 33)

  let y = 50

  // Stops & Activities
  const sortedStops = [...stops].sort((a, b) => a.order - b.order)

  sortedStops.forEach((stop, idx) => {
    const city = cities.find((c) => c.id === stop.cityId)
    const stopActivities = tripActivities.filter((ta) => ta.stopId === stop.id)

    // Check page overflow
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    // Stop Title
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(15, y, 180, 10, 2, 2, 'F')

    doc.setTextColor(79, 70, 229) // Indigo
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Stop ${idx + 1}: ${city?.name || 'Destination'} (${city?.region || ''})`, 18, y + 7)

    y += 16

    if (stopActivities.length === 0) {
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text('No scheduled anchors for this stop yet.', 20, y)
      y += 8
    } else {
      stopActivities.forEach((ta) => {
        const act = activities.find((a) => a.id === ta.activityId)
        if (y > 270) {
          doc.addPage()
          y = 20
        }

        doc.setTextColor(15, 23, 42)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`• ${act?.name || 'Activity'}`, 20, y)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 116, 139)
        doc.setFontSize(8)
        doc.text(`${ta.startTime || '10:00'}  |  ${formatCategoryLabel(act?.category || 'sightseeing')}  |  Cost: ${formatCurrency(ta.estimatedCost || 0)}`, 20, y + 4)

        y += 10
      })
    }

    y += 6
  })

  // Footer
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`Generated by GlobeTrotter Travel Platform  •  Page ${i} of ${totalPages}`, 105, 290, { align: 'center' })
  }

  doc.save(`${trip.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-itinerary.pdf`)
}
