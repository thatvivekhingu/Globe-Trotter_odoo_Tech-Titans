import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ToastViewport } from '../components/ui/Feedback'
import { useTripWise } from '../state/useTripWise'
import { useAuth } from '../state/useAuth'
import { AuthLoadingScreen } from '../components/auth/AuthLoadingScreen'
import { AuthPage } from '../features/auth/AuthPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { CreateTripPage } from '../features/trips/CreateTripPage'
import { MyTripsPage } from '../features/trips/MyTripsPage'
import { CitySearchPage, ActivitySearchPage } from '../features/discovery/DiscoveryPages'
import { ItineraryBuilderPage } from '../features/itinerary/ItineraryBuilderPage'
import { ItineraryViewPage } from '../features/itinerary/ItineraryViewPage'
import { BudgetPage } from '../features/budget/BudgetPage'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { SharedItineraryPage } from '../features/sharing/SharedItineraryPage'
import { ProfilePage, SettingsPage } from '../features/profile/ProfilePages'
import { SmartRecommendationPage } from '../features/ai/SmartRecommendationPage'
import { SmartPackingPage } from '../features/tools/SmartPackingPage'
import { BookingPage } from '../features/booking/BookingPage'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'

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
  return <div className="flex min-h-[60vh] items-center justify-center"><Card className="max-w-md text-center"><p className="eyebrow">404 · off the map</p><h1 className="mt-3 font-display text-4xl text-ink">This page took a wrong turn.</h1><p className="body-copy mt-3 text-sm">Let’s take you back to somewhere useful.</p><Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button></Card></div>
}

function AppRoutes() {
  const { state, dispatch } = useTripWise()
  return (
    <>
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
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/packing" element={<SmartPackingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastViewport toast={state.toast} onDismiss={() => dispatch({ type: 'DISMISS_TOAST' })} />
    </>
  )
}

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

export default App
