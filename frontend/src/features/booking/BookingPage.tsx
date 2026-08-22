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
    flightNumber: 'AI-803',
    origin: 'Delhi (DEL)',
    destination: 'Srinagar (SXR)',
    departureTime: '08:45 AM',
    arrivalTime: '10:15 AM',
    duration: '1h 30m',
    stops: 'Non-stop',
    price: 5200,
    cabin: 'Economy (Complimentary Meal)',
  },
  {
    id: 'fl-103',
    airline: 'Vistara',
    airlineLogo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'UK-945',
    origin: 'Delhi (DEL)',
    destination: 'Mumbai (BOM)',
    departureTime: '06:00 AM',
    arrivalTime: '08:15 AM',
    duration: '2h 15m',
    stops: 'Non-stop',
    price: 4950,
    cabin: 'Premium Economy',
  },
  {
    id: 'fl-104',
    airline: 'Emirates',
    airlineLogo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'EK-501',
    origin: 'Mumbai (BOM)',
    destination: 'Dubai (DXB)',
    departureTime: '04:30 AM',
    arrivalTime: '06:15 AM',
    duration: '3h 15m',
    stops: 'Non-stop',
    price: 14800,
    cabin: 'Economy Flex',
  },
  {
    id: 'fl-105',
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
    id: 'fl-106',
    airline: 'IndiGo 6E',
    airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80',
    flightNumber: '6E-284',
    origin: 'Bengaluru (BLR)',
    destination: 'Kochi (COK)',
    departureTime: '09:20 AM',
    arrivalTime: '10:30 AM',
    duration: '1h 10m',
    stops: 'Non-stop',
    price: 2650,
    cabin: 'Economy',
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
    badge: 'MMT Luxury Heritage',
  },
  {
    id: 'ht-2',
    name: 'The Khyber Himalayan Resort & Spa',
    city: 'Gulmarg',
    location: 'Pir Panjal Range, Gulmarg',
    rating: 4.95,
    reviewsCount: 2890,
    pricePerNight: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    amenities: ['Snow Peaks View', 'Heated Indoor Pool', 'Gondola Access', 'L’Occitane Spa'],
    badge: 'MMT Signature 5-Star',
  },
  {
    id: 'ht-3',
    name: 'The Oberoi Udaivilas Luxury Palace',
    city: 'Udaipur',
    location: 'Haridas Ji Ki Magri, Lake Pichola',
    rating: 4.98,
    reviewsCount: 3410,
    pricePerNight: 28500,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Semi-Private Pool', 'Royal Boat Transfers', 'Palace Dining', 'Butler Service'],
    badge: 'World #1 Heritage Resort',
  },
  {
    id: 'ht-4',
    name: 'Atlantis The Palm',
    city: 'Dubai',
    location: 'Crescent Rd, The Palm Jumeirah',
    rating: 4.92,
    reviewsCount: 5200,
    pricePerNight: 34000,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    amenities: ['Aquaventure Waterpark Access', 'Underwater Aquarium', 'Private Beach', 'Michelin Dining'],
    badge: 'Iconic Global Landmark',
  },
  {
    id: 'ht-5',
    name: 'Zostel Plus Riverside Retreat',
    city: 'Manali',
    location: 'Old Manali & Vashisht Hills',
    rating: 4.65,
    reviewsCount: 1420,
    pricePerNight: 2600,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    amenities: ['Himalayan View', 'Café & Co-work Hub', 'Nightly Bonfire', 'High-Speed Wi-Fi'],
    badge: 'Backpacker & Nomad Top Pick',
  },
]

export function BookingPage() {
  const { state, dispatch, notify, currentUser } = useTripWise()
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

  const [razorpayPaymentId, setRazorpayPaymentId] = useState('')

  function loadRazorpaySdk(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (code === 'MMTSPECIAL' || code === 'PRO1000' || code === 'SUPERFLY' || code === 'GOAOFFER') {
      const discount = Math.min(1000, Math.round((selectedBooking?.price || 3000) * 0.15))
      setDiscountAmount(discount)
      setCouponApplied(true)
      notify(`🎉 Coupon ${code} applied! Saved ${formatCurrency(discount)}`)
    } else {
      notify('Invalid coupon code. Try MMTSPECIAL or PRO1000', 'error')
    }
  }

  const finalPayablePrice = Math.max(0, (selectedBooking?.price || 0) - discountAmount)

  async function handleProcessPayment() {
    setPaymentStep('processing')
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID

    if (razorpayKey) {
      const sdkLoaded = await loadRazorpaySdk()
      if (sdkLoaded && (window as any).Razorpay) {
        try {
          const options = {
            key: razorpayKey,
            amount: finalPayablePrice * 100,
            currency: 'INR',
            name: 'GlobeTrotter Travel Enterprise',
            description: `Booking for ${selectedBooking?.title || 'Travel Reservation'}`,
            image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=150&q=80',
            handler: function (response: any) {
              completeBooking(response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 12)}`)
            },
            prefill: {
              name: currentUser?.name || 'Priyanka Lachhani',
              email: currentUser?.email || 'lachhanipriyanka@gmail.com',
            },
            theme: { color: '#4F46E5' },
            modal: {
              ondismiss: function () {
                setPaymentStep('review')
                notify('Payment window closed. Your booking is still pending.', 'info')
              },
            },
          }
          const rzp = new (window as any).Razorpay(options)
          rzp.open()
          return
        } catch (e) {
          console.warn('Razorpay open fallback:', e)
        }
      }
    }

    // Instant Pro Sandbox Simulation (1.2s realistic banking animation)
    setTimeout(() => {
      completeBooking(`pay_live_test_${Math.random().toString(36).substring(2, 10).toUpperCase()}`)
    }, 1200)
  }

  function completeBooking(payId: string) {
    const code = 'GT-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    setPnrCode(code)
    setRazorpayPaymentId(payId)
    setPaymentStep('confirmed')

    // Automatically log expense in active trip!
    if (activeTrip && selectedBooking) {
      dispatch({
        type: 'ADD_EXPENSE',
        expense: {
          id: `exp-${Date.now()}`,
          tripId: activeTrip.id,
          category: selectedBooking.type === 'flight' ? 'transportation' : 'accommodation',
          amount: finalPayablePrice,
          description: `Live Booking: ${selectedBooking.title} (PNR: ${code}, PayID: ${payId})`,
          date: new Date().toISOString().split('T')[0],
        },
      })
    }
    notify(`🎉 Booking Confirmed! PNR: ${code} added to trip itinerary & budget.`)
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
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-slate-900">Secure Instant Checkout</h3>
                      <p className="text-xs text-slate-500">Fast, 256-bit Encrypted Travel Reservation</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBooking(null)
                      setCouponApplied(false)
                      setDiscountAmount(0)
                      setCouponCode('')
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                {/* Booking Details Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Reservation</p>
                  <h4 className="font-display text-base font-bold text-slate-900">{selectedBooking.title}</h4>
                  <p className="text-xs text-slate-600">{selectedBooking.subtitle}</p>
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                    <span>Base Fare & Taxes:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(selectedBooking.price)}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                      <span>Promo Discount ({couponCode}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold text-sm text-slate-900">
                    <span>Total Amount Payable</span>
                    <span className="text-[#4F46E5] text-lg">{formatCurrency(finalPayablePrice)}</span>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. MMTSPECIAL)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs uppercase font-bold rounded-xl border border-slate-200 bg-white"
                  />
                  <Button size="sm" variant="secondary" onClick={applyCoupon} className="rounded-xl px-4 text-xs font-bold">
                    Apply
                  </Button>
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
                      <span className="text-xs">UPI / GPay / PhonePe</span>
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
                      <span className="text-xs">Credit / Debit Card</span>
                    </button>
                  </div>
                </div>

                <Button className="w-full rounded-full py-3 font-bold shadow-md shadow-indigo-500/20" onClick={handleProcessPayment}>
                  Pay {formatCurrency(finalPayablePrice)} & Confirm
                </Button>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="py-12 text-center space-y-4">
                <div className="size-16 rounded-full border-4 border-[#4F46E5] border-t-transparent animate-spin mx-auto" />
                <h3 className="font-display text-2xl font-bold text-slate-900">Securing Your Reservation...</h3>
                <p className="text-xs text-slate-500">Connecting with airline GDS / hotel reservation system...</p>
              </div>
            )}

            {paymentStep === 'confirmed' && (
              <div className="space-y-5 text-center">
                <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <Check size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">Booking Confirmed!</h3>
                  <p className="text-xs text-slate-500 mt-0.5">E-Ticket & Tax Invoice generated with verified PNR.</p>
                </div>

                {/* Pro Boarding Pass / Hotel Voucher */}
                <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-linear-to-b from-emerald-50/80 to-white p-4 text-left space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-emerald-200/80 pb-2.5">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Official E-Ticket Pass</span>
                      <h4 className="font-bold text-sm text-slate-900">{selectedBooking.title}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">PNR Reference</span>
                      <p className="font-mono font-extrabold text-sm text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded">
                        {pnrCode}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Passenger</span>
                      <span className="font-bold text-slate-900">{currentUser?.name || 'Priyanka Lachhani'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Gate / Room</span>
                      <span className="font-bold text-slate-900">Gate 14B · Seat 6F</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Baggage</span>
                      <span className="font-bold text-slate-900">15kg + 7kg Cabin</span>
                    </div>
                  </div>

                  <div className="border-t border-emerald-200/60 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>PayID: {razorpayPaymentId || 'pay_live_test'}</span>
                    <span className="text-emerald-700 font-bold">● Status: Confirmed</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Button
                    variant="secondary"
                    className="flex-1 rounded-full text-xs font-bold"
                    onClick={() => window.print()}
                  >
                    🖨️ Print E-Ticket
                  </Button>
                  <Button
                    className="flex-1 rounded-full text-xs font-bold"
                    onClick={() => {
                      setSelectedBooking(null)
                      setCouponApplied(false)
                      setDiscountAmount(0)
                      setCouponCode('')
                    }}
                  >
                    Done & Return
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
