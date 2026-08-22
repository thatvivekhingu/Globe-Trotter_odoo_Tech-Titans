import { useState } from 'react'
import { Check, CreditCard, Hotel, MapPin, Plane, QrCode, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'

interface FlightItem {
  id: string
  airline: string
  airlineLogo: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  stops: string
  price: number
  cabin: string
}

interface HotelItem {
  id: string
  name: string
  city: string
  location: string
  rating: number
  reviewsCount: number
  pricePerNight: number
  imageUrl: string
  amenities: string[]
  badge: string
}

const SAMPLE_FLIGHTS: FlightItem[] = [
  {
    id: 'fl-101',
    airline: 'IndiGo 6E',
    airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80',
    flightNumber: '6E-5342',
    origin: 'Mumbai (BOM)',
    destination: 'Goa (GOI)',
    departureTime: '07:15 AM',
    arrivalTime: '08:35 AM',
    duration: '1h 20m',
    stops: 'Non-stop',
    price: 3450,
    cabin: 'Economy',
  },
  {
    id: 'fl-102',
    airline: 'Air India',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'AI-683',
    origin: 'Mumbai (BOM)',
    destination: 'Goa (GOX)',
    departureTime: '11:30 AM',
    arrivalTime: '12:45 PM',
    duration: '1h 15m',
    stops: 'Non-stop',
    price: 4100,
    cabin: 'Economy (Meals included)',
  },
  {
    id: 'fl-103',
    airline: 'Akasa Air',
    airlineLogo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'QP-1392',
    origin: 'Delhi (DEL)',
    destination: 'Jaipur (JAI)',
    departureTime: '06:00 AM',
    arrivalTime: '07:05 AM',
    duration: '1h 05m',
    stops: 'Non-stop',
    price: 2890,
    cabin: 'Economy',
  },
  {
    id: 'fl-104',
    airline: 'Vistara',
    airlineLogo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'UK-871',
    origin: 'Ahmedabad (AMD)',
    destination: 'Goa (GOI)',
    departureTime: '02:45 PM',
    arrivalTime: '04:30 PM',
    duration: '1h 45m',
    stops: 'Non-stop',
    price: 4800,
    cabin: 'Premium Economy',
  },
]

const SAMPLE_HOTELS: HotelItem[] = [
  {
    id: 'ht-1',
    name: 'Taj Fort Aguada Resort & Spa',
    city: 'Goa',
    location: 'Sinquerim Beach, Candolim',
    rating: 4.8,
    reviewsCount: 1240,
    pricePerNight: 14500,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    amenities: ['Sea View', 'Infinity Pool', 'Breakfast Included', 'Spa'],
    badge: 'Luxury Heritage',
  },
  {
    id: 'ht-2',
    name: 'Alila Diwa Coastal Sanctuary',
    city: 'Goa',
    location: 'Majorda, South Goa',
    rating: 4.7,
    reviewsCount: 890,
    pricePerNight: 9800,
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    amenities: ['Paddy Views', 'Free Shuttle', 'Outdoor Pool', 'Bar'],
    badge: 'Boutique Stay',
  },
  {
    id: 'ht-3',
    name: 'The Leela Palace',
    city: 'Jaipur',
    location: 'Amer Road, Kukas',
    rating: 4.9,
    reviewsCount: 2150,
    pricePerNight: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Royal Suites', 'Palace Dining', 'Spa & Wellness', 'Valet'],
    badge: 'Royal Palace',
  },
  {
    id: 'ht-4',
    name: 'Zostel Plus Hillview Retreat',
    city: 'Manali',
    location: 'Old Manali, Hills',
    rating: 4.6,
    reviewsCount: 940,
    pricePerNight: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    amenities: ['Himalayan View', 'Café & Co-work', 'Bonfire', 'Fast Wi-Fi'],
    badge: 'Backpacker Favorite',
  },
]

export function BookingPage() {
  const { state, dispatch, notify } = useTripWise()
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights')
  const [origin, setOrigin] = useState('Mumbai (BOM)')
  const [destination, setDestination] = useState('Goa (GOI)')
  const [hotelCity, setHotelCity] = useState('Goa')
  const [passengers, setPassengers] = useState(1)

  // Booking Checkout State
  const [selectedBooking, setSelectedBooking] = useState<{
    type: 'flight' | 'hotel'
    title: string
    subtitle: string
    price: number
    id: string
  } | null>(null)

  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'confirmed'>('review')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi')
  const [pnrCode, setPnrCode] = useState('')

  const activeTrip = state.db.trips[0]

  function openCheckout(item: FlightItem | HotelItem, type: 'flight' | 'hotel') {
    if (type === 'flight') {
      const flight = item as FlightItem
      setSelectedBooking({
        type: 'flight',
        title: `${flight.airline} (${flight.flightNumber})`,
        subtitle: `${flight.origin} → ${flight.destination} · ${flight.departureTime}`,
        price: flight.price * passengers,
        id: flight.id,
      })
    } else {
      const hotel = item as HotelItem
      setSelectedBooking({
        type: 'hotel',
        title: hotel.name,
        subtitle: `${hotel.city} · 2 Nights Stay`,
        price: hotel.pricePerNight * 2,
        id: hotel.id,
      })
    }
    setPaymentStep('review')
  }

  function handleProcessPayment() {
    setPaymentStep('processing')
    setTimeout(() => {
      const code = 'GT-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      setPnrCode(code)
      setPaymentStep('confirmed')

      // Automatically log expense in active trip!
      if (activeTrip && selectedBooking) {
        dispatch({
          type: 'ADD_EXPENSE',
          expense: {
            id: `exp-${Date.now()}`,
            tripId: activeTrip.id,
            category: selectedBooking.type === 'flight' ? 'transportation' : 'accommodation',
            amount: selectedBooking.price,
            description: `Live Booking: ${selectedBooking.title} (${code})`,
            date: new Date().toISOString().split('T')[0],
          },
        })
      }
      notify(`Booking Confirmed! PNR: ${code} added to trip expenses.`)
    }, 1500)
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} /> Live Travel Aggregator
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Live Flight & Hotel Bookings
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            Search real-time airline fares, verified boutique stays, and book with simulated instant Razorpay checkout.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'flights' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plane size={15} className={activeTab === 'flights' ? 'text-[#4F46E5]' : ''} />
            Flights
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hotels')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hotels' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Hotel size={15} className={activeTab === 'hotels' ? 'text-[#4F46E5]' : ''} />
            Hotels & Resorts
          </button>
        </div>
      </div>

      {/* Flight Search Section */}
      {activeTab === 'flights' && (
        <div className="space-y-6">
          {/* Search Box */}
          <Card className="p-5 border border-slate-200/80 shadow-sm bg-white">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">From</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                >
                  <option value="Mumbai (BOM)">Mumbai (BOM)</option>
                  <option value="Delhi (DEL)">Delhi (DEL)</option>
                  <option value="Ahmedabad (AMD)">Ahmedabad (AMD)</option>
                  <option value="Bengaluru (BLR)">Bengaluru (BLR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">To</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                >
                  <option value="Goa (GOI)">Goa (GOI / GOX)</option>
                  <option value="Jaipur (JAI)">Jaipur (JAI)</option>
                  <option value="Kullu/Manali (KUU)">Manali (KUU)</option>
                  <option value="Udaipur (UDR)">Udaipur (UDR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Travel Date</label>
                <input
                  type="date"
                  defaultValue="2026-10-03"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Travellers</label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={4}>4 Travellers (Group)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Flight Search Results */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Available Flights ({SAMPLE_FLIGHTS.length})
              </h2>
              <span className="text-xs text-slate-500 font-medium">Sorted by Best Value</span>
            </div>

            <div className="grid gap-3.5">
              {SAMPLE_FLIGHTS.map((flight) => (
                <Card
                  key={flight.id}
                  className="p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-slate-100 p-1 flex items-center justify-center border border-slate-200 overflow-hidden">
                      <ImageWithFallback
                        src={flight.airlineLogo}
                        alt={flight.airline}
                        className="size-full object-cover rounded-lg"
                        fallbackClassName="size-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{flight.airline}</h3>
                        <Badge tone="neutral">{flight.flightNumber}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{flight.cabin}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="font-display text-lg font-bold text-slate-900">{flight.departureTime}</p>
                      <p className="text-[11px] text-slate-500">{flight.origin.split(' ')[0]}</p>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{flight.duration}</span>
                      <div className="w-20 sm:w-28 h-0.5 bg-slate-200 relative flex items-center justify-center">
                        <Plane size={12} className="text-[#4F46E5] absolute" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">{flight.stops}</span>
                    </div>

                    <div className="text-center">
                      <p className="font-display text-lg font-bold text-slate-900">{flight.arrivalTime}</p>
                      <p className="text-[11px] text-slate-500">{flight.destination.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                    <div>
                      <p className="font-display text-xl font-bold text-slate-900 text-right">
                        {formatCurrency(flight.price * passengers)}
                      </p>
                      <p className="text-[10px] text-slate-400 text-right">
                        {passengers > 1 ? `₹${flight.price} × ${passengers}` : 'per person'}
                      </p>
                    </div>
                    <Button size="sm" className="rounded-full px-5 font-bold" onClick={() => openCheckout(flight, 'flight')}>
                      Book Flight
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hotel Search Section */}
      {activeTab === 'hotels' && (
        <div className="space-y-6">
          <Card className="p-5 border border-slate-200/80 shadow-sm bg-white">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Destination City</label>
                <select
                  value={hotelCity}
                  onChange={(e) => setHotelCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                >
                  <option value="Goa">Goa (North & South)</option>
                  <option value="Jaipur">Jaipur (Pink City)</option>
                  <option value="Manali">Manali (Himalayas)</option>
                  <option value="Udaipur">Udaipur (Lakes)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Dates</label>
                <input
                  type="text"
                  defaultValue="3 Oct 2026 - 5 Oct 2026 (2 Nights)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Guests</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900">
                  <option>1 Room · 2 Guests</option>
                  <option>2 Rooms · 4 Guests</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            {SAMPLE_HOTELS.map((hotel) => (
              <Card
                key={hotel.id}
                className="overflow-hidden border border-slate-200/80 hover:shadow-lg transition-all p-0 rounded-2xl bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="size-full object-cover hover:scale-105 transition-transform duration-500"
                      fallbackClassName="size-full"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                      {hotel.badge}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {hotel.rating} ({hotel.reviewsCount})
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-display text-xl font-bold text-slate-900">{hotel.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={13} className="text-[#4F46E5]" /> {hotel.location}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {hotel.amenities.map((am) => (
                        <span key={am} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <p className="font-display text-xl font-bold text-slate-900">
                      {formatCurrency(hotel.pricePerNight)}
                    </p>
                    <p className="text-[10px] text-slate-400">per night + taxes</p>
                  </div>
                  <Button size="sm" className="rounded-full px-5 font-bold" onClick={() => openCheckout(hotel, 'hotel')}>
                    Reserve Room
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Razorpay / UPI Instant Checkout Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border border-slate-200">
            {paymentStep === 'review' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-slate-900">Secure Checkout</h3>
                      <p className="text-xs text-slate-500">Fast & Verified Travel Booking</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                {/* Booking Details Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Item</p>
                  <h4 className="font-display text-base font-bold text-slate-900">{selectedBooking.title}</h4>
                  <p className="text-xs text-slate-600">{selectedBooking.subtitle}</p>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold text-sm text-slate-900">
                    <span>Total Amount Payable</span>
                    <span className="text-[#4F46E5] text-lg">{formatCurrency(selectedBooking.price)}</span>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Choose Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#4F46E5] bg-indigo-50/60 font-bold text-[#4F46E5]'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <QrCode size={18} />
                      <span className="text-xs">UPI / GPay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#4F46E5] bg-indigo-50/60 font-bold text-[#4F46E5]'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="text-xs">Debit / Card</span>
                    </button>
                  </div>
                </div>

                <Button className="w-full rounded-full py-3 font-bold" onClick={handleProcessPayment}>
                  Pay {formatCurrency(selectedBooking.price)} & Confirm
                </Button>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="py-12 text-center space-y-4">
                <div className="size-16 rounded-full border-4 border-[#4F46E5] border-t-transparent animate-spin mx-auto" />
                <h3 className="font-display text-2xl font-bold text-slate-900">Processing Payment...</h3>
                <p className="text-xs text-slate-500">Contacting airline/hotel reservations and securing seats...</p>
              </div>
            )}

            {paymentStep === 'confirmed' && (
              <div className="space-y-6 text-center">
                <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <Check size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">Booking Confirmed!</h3>
                  <p className="text-xs text-slate-500 mt-1">E-ticket & invoice generated successfully.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-800 font-semibold">Booking PNR:</span>
                    <span className="font-mono font-bold text-emerald-950 text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {pnrCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-800 font-semibold">Item:</span>
                    <span className="font-bold text-emerald-950">{selectedBooking.title}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-800 font-semibold">Status:</span>
                    <span className="text-emerald-700 font-bold">Paid & Added to Trip Budget</span>
                  </div>
                </div>

                <Button className="w-full rounded-full" onClick={() => setSelectedBooking(null)}>
                  Done & Return
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
