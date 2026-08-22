import { useState, useEffect } from 'react'
import { ArrowRight, Calendar, Flame, Sparkles, Star, Tag, Timer } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'
import { Link, useNavigate } from 'react-router-dom'

interface TourPackage {
  id: string
  title: string
  destination: string
  region: 'India' | 'International' | 'Europe' | 'Himalayas' | 'Beaches'
  duration: string
  daysCount: number
  imageUrl: string
  rating: number
  reviewsCount: number
  originalPrice: number
  discountPrice: number
  savingsAmount: number
  highlights: string[]
  inclusions: string[]
  trending?: boolean
}

const DESTINATION_TABS = [
  { id: 'all', label: 'All Tours', icon: '🌍' },
  { id: 'goa', label: 'Goa', icon: '🏖️', trending: true },
  { id: 'kashmir', label: 'Kashmir', icon: '❄️', trending: true },
  { id: 'rajasthan', label: 'Rajasthan', icon: '🏰', trending: true },
  { id: 'dubai', label: 'Dubai', icon: '🏙️', trending: true },
  { id: 'kerala', label: 'Kerala', icon: '🛶' },
  { id: 'ladakh', label: 'Ladakh', icon: '🏔️' },
  { id: 'andaman', label: 'Andaman', icon: '🐠' },
  { id: 'bali', label: 'Bali', icon: '🌴' },
  { id: 'europe', label: 'Europe', icon: '🗼' },
]

const TOUR_PACKAGES: TourPackage[] = [
  {
    id: 'tour-1',
    title: 'Royal Rajasthan Heritage & Desert Safari Odyssey',
    destination: 'Jaipur - Jodhpur - Udaipur - Jaisalmer',
    region: 'India',
    duration: '7 Days / 6 Nights',
    daysCount: 7,
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 1420,
    originalPrice: 48500,
    discountPrice: 28999,
    savingsAmount: 19501,
    highlights: ['Sam Sand Dunes Camel Safari', 'Amber Fort Sound & Light Show', 'Lake Pichola Sunset Boat Cruise'],
    inclusions: ['4-Star Heritage Stays', 'Daily Buffet Breakfast & Dinner', 'Private AC Cab', 'Desert Camp & Folk Dance'],
    trending: true,
  },
  {
    id: 'tour-2',
    title: 'Magical Kashmir: Gulmarg Gondola & Dal Lake Shikara',
    destination: 'Srinagar - Gulmarg - Pahalgam - Sonamarg',
    region: 'Himalayas',
    duration: '6 Days / 5 Nights',
    daysCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    reviewsCount: 2150,
    originalPrice: 42000,
    discountPrice: 24500,
    savingsAmount: 17500,
    highlights: ['Gulmarg Phase 2 Cable Car', 'Luxury Houseboat Stay on Dal Lake', 'Betaab Valley Pony Trek'],
    inclusions: ['Luxury Houseboat + Resorts', 'All Transfers by Innova', 'Daily Meals', 'Gondola Tickets Assistance'],
    trending: true,
  },
  {
    id: 'tour-3',
    title: 'Scenic Switzerland & Paris Dreams Grand Tour',
    destination: 'Paris - Lucerne - Interlaken - Zurich',
    region: 'Europe',
    duration: '8 Days / 7 Nights',
    daysCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 890,
    originalPrice: 210000,
    discountPrice: 134100,
    savingsAmount: 75900,
    highlights: ['Mount Jungfraujoch Top of Europe', 'Eiffel Tower 2nd Level Access', 'Lake Lucerne Scenic Cruise'],
    inclusions: ['Swiss Travel Pass (Unlimited Trains)', 'Central 4-Star Hotels', 'Daily Breakfast', 'Schengen Visa Assistance'],
  },
  {
    id: 'tour-4',
    title: 'Tropical Bali: Nusa Penida & Ubud Jungle Villa Escape',
    destination: 'Kuta - Ubud - Nusa Penida - Seminyak',
    region: 'International',
    duration: '6 Days / 5 Nights',
    daysCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    rating: 4.88,
    reviewsCount: 1840,
    originalPrice: 58000,
    discountPrice: 34999,
    savingsAmount: 23001,
    highlights: ['Private Pool Villa in Ubud', 'Kelingking T-Rex Beach Nusa Penida', 'Mount Batur Sunrise Jeep Safari'],
    inclusions: ['Private Pool Villa + 4-Star Resort', 'Private Island Speedboat', 'Daily Breakfast', 'Free Water Sports'],
    trending: true,
  },
  {
    id: 'tour-5',
    title: 'Ladakh Bike Expedition: Pangong Lake & Khardung La',
    destination: 'Leh - Nubra Valley - Turtuk - Pangong Tso',
    region: 'Himalayas',
    duration: '7 Days / 6 Nights',
    daysCount: 7,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    rating: 4.92,
    reviewsCount: 3100,
    originalPrice: 46000,
    discountPrice: 27500,
    savingsAmount: 18500,
    highlights: ['Himalayan 411cc Royal Enfield Bike', 'Camp Under Milky Way at Pangong', 'World Highest Motor Road Khardung La'],
    inclusions: ['Royal Enfield + Fuel', 'Riding Gear & Mechanic Support', 'Oxygen Cylinders', 'Camps & Hotels'],
  },
  {
    id: 'tour-6',
    title: 'Kerala Backwaters, Munnar Tea Gardens & Houseboat',
    destination: 'Kochi - Munnar - Thekkady - Alleppey',
    region: 'India',
    duration: '5 Days / 4 Nights',
    daysCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    rating: 4.85,
    reviewsCount: 1290,
    originalPrice: 34000,
    discountPrice: 19800,
    savingsAmount: 14200,
    highlights: ['Private Alleppey Houseboat Cruise', 'Munnar Eravikulam Tea Estate', 'Periyar Wildlife Sanctuary'],
    inclusions: ['Private Air-conditioned Houseboat', 'Resorts in Munnar', 'Traditional Kerala Meals', 'Chauffeur Driven AC Cab'],
  },
  {
    id: 'tour-7',
    title: 'Goa Premium Beach Getaway: Mandovi Cruise & Water Sports',
    destination: 'Calangute - Baga - Candolim - Mandovi River',
    region: 'Beaches',
    duration: '4 Days / 3 Nights',
    daysCount: 4,
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 2450,
    originalPrice: 28000,
    discountPrice: 16999,
    savingsAmount: 11001,
    highlights: ['Grand Island Scuba Dive', 'Big Daddy Casino Mandovi Pass', 'Baga Beach Candlelight Dinner'],
    inclusions: ['4-Star Candolim Beach Resort', 'Airport Transfers in AC Cab', 'Buffet Breakfast', 'Complimentary Scuba Video'],
    trending: true,
  },
  {
    id: 'tour-8',
    title: 'Dubai Dazzle: Burj Khalifa 124th Floor & Red Dunes Safari',
    destination: 'Downtown Dubai - Palm Jumeirah - Dubai Marina',
    region: 'International',
    duration: '5 Days / 4 Nights',
    daysCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    rating: 4.93,
    reviewsCount: 3890,
    originalPrice: 72000,
    discountPrice: 44500,
    savingsAmount: 27500,
    highlights: ['Burj Khalifa At The Top Access', '4x4 Desert Safari with Live BBQ & Fire Show', 'Marina Dhow Luxury Cruise Dinner'],
    inclusions: ['4-Star City Center Hotel', 'UAE Tourist Visa Assistance', 'All Sightseeing in AC Coach', 'Daily Breakfast'],
    trending: true,
  },
  {
    id: 'tour-9',
    title: 'Andaman Island Paradise: Radhanagar Beach & Coral Reefs',
    destination: 'Port Blair - Havelock Island - Neil Island',
    region: 'Beaches',
    duration: '6 Days / 5 Nights',
    daysCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    rating: 4.96,
    reviewsCount: 1720,
    originalPrice: 52000,
    discountPrice: 31800,
    savingsAmount: 20200,
    highlights: ['Radhanagar Beach Sunset', 'Elephant Beach Sea Walk & Snorkeling', 'Makruzz Premium Cruise Transfers'],
    inclusions: ['Beachside Boutique Resorts', 'Private AC Vehicle for all transfers', 'Inter-Island Catamaran Ferry', 'Daily Breakfast & Dinner'],
  },
]

export function TourPackagesPage() {
  const { notify } = useTripWise()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null)
  const [countdown, setCountdown] = useState({ days: 6, hours: 9, minutes: 15, seconds: 42 })

  // Live ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredTours = TOUR_PACKAGES.filter((p) => {
    if (activeTab === 'all') return true
    if (activeTab === 'goa') return p.destination.toLowerCase().includes('goa') || p.title.toLowerCase().includes('goa')
    if (activeTab === 'rajasthan') return p.destination.toLowerCase().includes('rajasthan') || p.title.toLowerCase().includes('rajasthan')
    if (activeTab === 'kashmir') return p.destination.toLowerCase().includes('kashmir') || p.title.toLowerCase().includes('kashmir')
    if (activeTab === 'dubai') return p.destination.toLowerCase().includes('dubai') || p.title.toLowerCase().includes('dubai')
    if (activeTab === 'ladakh') return p.destination.toLowerCase().includes('ladakh') || p.title.toLowerCase().includes('leh')
    if (activeTab === 'andaman') return p.destination.toLowerCase().includes('andaman') || p.destination.toLowerCase().includes('havelock') || p.title.toLowerCase().includes('andaman')
    if (activeTab === 'kerala') return p.destination.toLowerCase().includes('kerala') || p.destination.toLowerCase().includes('munnar')
    if (activeTab === 'bali') return p.destination.toLowerCase().includes('bali')
    if (activeTab === 'europe') return p.region === 'Europe'
    return true
  })

  function handlePersonalizeWithAi(tour: TourPackage) {
    notify(`⚡ Loading ${tour.title} into AI Itinerary Builder...`)
    navigate('/recommendations')
  }

  function handleInstantBook(tour: TourPackage) {
    notify(`🎉 Booking confirmed for "${tour.title}" at discounted price ${formatCurrency(tour.discountPrice)}!`)
    setSelectedPackage(null)
  }

  return (
    <div className="space-y-10">
      {/* 1. Thrillophilia-Style Monsoon Sale Banner */}
      <div className="bg-linear-to-r from-[#0052D4] via-[#4364F7] to-[#6FB1FC] text-white py-2.5 px-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold">
            Monsoon Sale
          </span>
          <span>Save Up to 40% Off On Expertly Curated Tours & Stays</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-black/20 px-3 py-1 rounded-xl">
          <Timer size={13} className="text-amber-300 animate-pulse" />
          <span>{countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s</span>
        </div>
      </div>

      {/* 2. Thrillophilia Signature Collage Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-orange-50/50 via-white to-amber-50/30 p-8 sm:p-12 border border-orange-100/80 shadow-xs">
        {/* Floating Collage Photo Badges Left & Right */}
        <div className="hidden xl:block absolute left-4 top-1/2 -translate-y-1/2 space-y-3 pointer-events-none opacity-85">
          <div className="size-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white -rotate-6">
            <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=150&q=80" alt="Dubai Burj" className="size-full object-cover" />
          </div>
          <div className="size-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white rotate-6 ml-6">
            <img src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=150&q=80" alt="Taj Mahal" className="size-full object-cover" />
          </div>
        </div>

        <div className="hidden xl:block absolute right-4 top-1/2 -translate-y-1/2 space-y-3 pointer-events-none opacity-85">
          <div className="size-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white rotate-6">
            <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=150&q=80" alt="Paris Eiffel" className="size-full object-cover" />
          </div>
          <div className="size-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white -rotate-6 mr-6">
            <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=150&q=80" alt="Bali Gates" className="size-full object-cover" />
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-900 text-xs font-bold">
            <Sparkles size={13} className="text-orange-600" /> Handcrafted Multi-Day Experiential Journeys
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            Your Tour, Perfectly <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Personalised!</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Explore 100+ verified multi-day itineraries with 4-star boutique stays, licensed guides, and real-time AI personalization.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 shadow-md shadow-orange-500/20"
            >
              <Link to="/recommendations">
                <Sparkles size={15} className="mr-1.5" /> Plan Custom Tour with AI
              </Link>
            </Button>
            <Button
              variant="secondary"
              className="rounded-full bg-white text-slate-800 border border-slate-200"
              onClick={() => {
                const el = document.getElementById('packages-grid')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Browse All Packages <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Interactive Destination Icons Carousel (Thrillophilia-style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900">Explore by Top Destinations</h3>
          <span className="text-xs text-slate-500">Curated by travel experts</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {DESTINATION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shrink-0 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.trending && (
                <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider font-extrabold">
                  Hot
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Curated Tour Packages Grid with Discount Ribbons */}
      <div id="packages-grid" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Featured Expeditions</p>
            <h2 className="font-display text-2xl font-bold text-slate-900">Bestselling Tour Packages</h2>
          </div>
          <Badge tone="clay">{filteredTours.length} Verified Packages</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredTours.map((tour) => (
            <Card
              key={tour.id}
              className="rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Discount Ribbon */}
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={tour.imageUrl}
                    alt={tour.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Savings Ribbon Tag */}
                  <div className="absolute top-3 left-3 bg-[#0052D4] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Tag size={12} /> Save {formatCurrency(tour.savingsAmount)}
                  </div>

                  {tour.trending && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Flame size={12} /> Trending
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar size={13} className="text-amber-300" /> {tour.duration}
                    </span>
                    <span className="flex items-center gap-1 font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Star size={12} className="text-amber-400 fill-amber-400" /> {tour.rating} ({tour.reviewsCount})
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {tour.destination}
                    </span>
                    <h3 className="font-display text-base font-bold text-slate-900 mt-0.5 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {tour.title}
                    </h3>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-700">Tour Highlights:</p>
                    <ul className="text-[11px] text-slate-500 space-y-0.5 pl-3 list-disc">
                      {tour.highlights.map((h, i) => (
                        <li key={i} className="truncate">{h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Inclusions Pill Bar */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tour.inclusions.slice(0, 2).map((inc, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        ✓ {inc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer with Price & Actions */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-slate-400 line-through">
                    {formatCurrency(tour.originalPrice)}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-xl font-bold text-slate-900">
                      {formatCurrency(tour.discountPrice)}
                    </span>
                    <span className="text-[10px] text-slate-500">/ person</span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handlePersonalizeWithAi(tour)}
                    className="rounded-full text-xs font-bold"
                  >
                    Personalise
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedPackage(tour)}
                    className="rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Package Reservation</span>
                <h3 className="font-display text-xl font-bold text-slate-900">{selectedPackage.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Duration:</span>
                <span className="font-bold text-slate-900">{selectedPackage.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Destinations:</span>
                <span className="font-semibold text-slate-800">{selectedPackage.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discounted Tour Fare:</span>
                <span className="font-display text-lg font-bold text-orange-600">{formatCurrency(selectedPackage.discountPrice)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Lead Traveler Details</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  defaultValue="Aarav Mehta"
                  placeholder="Full Name"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs w-full"
                />
                <input
                  type="tel"
                  defaultValue="+91 9876543210"
                  placeholder="Phone Number"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs w-full"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1 rounded-full text-xs" onClick={() => setSelectedPackage(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                onClick={() => handleInstantBook(selectedPackage)}
              >
                Confirm & Pay ({formatCurrency(selectedPackage.discountPrice)})
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
