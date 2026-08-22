import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ToastViewport } from '../components/ui/Feedback'
import { useTripWise } from '../state/useTripWise'
import { useAuth } from '../state/useAuth'
import { AuthLoadingScreen } from '../components/auth/AuthLoadingScreen'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'

// Dynamic lazy imports for optimal code splitting & fast initial page loads
const AuthPage = lazy(() => import('../features/auth/AuthPage').then(m => ({ default: m.AuthPage })))
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const CreateTripPage = lazy(() => import('../features/trips/CreateTripPage').then(m => ({ default: m.CreateTripPage })))
const MyTripsPage = lazy(() => import('../features/trips/MyTripsPage').then(m => ({ default: m.MyTripsPage })))
const CitySearchPage = lazy(() => import('../features/discovery/DiscoveryPages').then(m => ({ default: m.CitySearchPage })))
const ActivitySearchPage = lazy(() => import('../features/discovery/DiscoveryPages').then(m => ({ default: m.ActivitySearchPage })))
const ItineraryBuilderPage = lazy(() => import('../features/itinerary/ItineraryBuilderPage').then(m => ({ default: m.ItineraryBuilderPage })))
const ItineraryViewPage = lazy(() => import('../features/itinerary/ItineraryViewPage').then(m => ({ default: m.ItineraryViewPage })))
const BudgetPage = lazy(() => import('../features/budget/BudgetPage').then(m => ({ default: m.BudgetPage })))
const CalendarPage = lazy(() => import('../features/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })))
const SharedItineraryPage = lazy(() => import('../features/sharing/SharedItineraryPage').then(m => ({ default: m.SharedItineraryPage })))
const ProfilePage = lazy(() => import('../features/profile/ProfilePages').then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('../features/profile/ProfilePages').then(m => ({ default: m.SettingsPage })))
const SmartRecommendationPage = lazy(() => import('../features/ai/SmartRecommendationPage').then(m => ({ default: m.SmartRecommendationPage })))
const SmartPackingPage = lazy(() => import('../features/tools/SmartPackingPage').then(m => ({ default: m.SmartPackingPage })))
const SafetyAndLanguagePage = lazy(() => import('../features/tools/SafetyAndLanguagePage').then(m => ({ default: m.SafetyAndLanguagePage })))
const AnalyticsReportsPage = lazy(() => import('../features/analytics/AnalyticsReportsPage').then(m => ({ default: m.AnalyticsReportsPage })))
const OdooIntegrationPage = lazy(() => import('../features/odoo/OdooIntegrationPage').then(m => ({ default: m.OdooIntegrationPage })))
const PricingPage = lazy(() => import('../features/pricing/PricingPage').then(m => ({ default: m.PricingPage })))
const VisaAssistancePage = lazy(() => import('../features/visa/VisaAssistancePage').then(m => ({ default: m.VisaAssistancePage })))
const ForexAndInsurancePage = lazy(() => import('../features/forex/ForexAndInsurancePage').then(m => ({ default: m.ForexAndInsurancePage })))
const TourPackagesPage = lazy(() => import('../features/packages/TourPackagesPage').then(m => ({ default: m.TourPackagesPage })))
const BookingPage = lazy(() => import('../features/booking/BookingPage').then(m => ({ default: m.BookingPage })))

function PageLoadingSkeleton() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center animate-pulse">
      <div className="size-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4 text-[#4F46E5]">
        <div className="size-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="h-4 w-40 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-28 bg-slate-100 rounded" />
    </div>
  )
}

function HomeRedirect() {
  const { status } = useAuth()
  if (status === 'loading') return <AuthLoadingScreen />
  return <Navigate to={status === 'authenticated' || status === 'demo' ? '/dashboard' : '/login'} replace />
}

function ProtectedLayout() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <AuthLoadingScreen />
  if (status !== 'authenticated' && status !== 'demo') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <AppShell><Outlet /></AppShell>
}

function LogoutRoute() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    void logout().finally(() => navigate('/login', { replace: true }))
  }, [logout, navigate])
  return <AuthLoadingScreen />
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <p className="eyebrow">404 · off the map</p>
        <h1 className="mt-3 font-display text-4xl text-ink">This page took a wrong turn.</h1>
        <p className="body-copy mt-3 text-sm">Let’s take you back to somewhere useful.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </Card>
    </div>
  )
}

function AppRoutes() {
  const { state, dispatch } = useTripWise()
  return (
    <>
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/shared/:shareToken" element={<SharedItineraryPage />} />
          <Route path="/logout" element={<LogoutRoute />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trips" element={<MyTripsPage />} />
            <Route path="/trips/new" element={<CreateTripPage />} />
            <Route path="/trips/:tripId" element={<Navigate to="builder" replace />} />
            <Route path="/trips/:tripId/builder" element={<ItineraryBuilderPage />} />
            <Route path="/trips/:tripId/itinerary" element={<ItineraryViewPage />} />
            <Route path="/trips/:tripId/budget" element={<BudgetPage />} />
            <Route path="/trips/:tripId/calendar" element={<CalendarPage />} />
            <Route path="/discover/cities" element={<CitySearchPage />} />
            <Route path="/discover/activities" element={<ActivitySearchPage />} />
            <Route path="/recommendations" element={<SmartRecommendationPage />} />
            <Route path="/plan" element={<SmartRecommendationPage />} />
            <Route path="/packages" element={<TourPackagesPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/visa" element={<VisaAssistancePage />} />
            <Route path="/forex" element={<ForexAndInsurancePage />} />
            <Route path="/safety" element={<SafetyAndLanguagePage />} />
            <Route path="/analytics" element={<AnalyticsReportsPage />} />
            <Route path="/reports" element={<AnalyticsReportsPage />} />
            <Route path="/odoo" element={<OdooIntegrationPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/packing" element={<SmartPackingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ToastViewport toast={state.toast} onDismiss={() => dispatch({ type: 'DISMISS_TOAST' })} />
    </>
  )
}

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

export default App

