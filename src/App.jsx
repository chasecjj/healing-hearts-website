import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const WebinarsListView = React.lazy(() => import('./pages/admin/WebinarsListView'));
const WebinarDetailView = React.lazy(() => import('./pages/admin/WebinarDetailView'));
const EnrollmentsListView = React.lazy(() => import('./pages/admin/EnrollmentsListView'));
const EnrollmentDetailView = React.lazy(() => import('./pages/admin/EnrollmentDetailView'));
const BroadcastsListView = React.lazy(() => import('./pages/admin/BroadcastsListView'));
const BroadcastDetailView = React.lazy(() => import('./pages/admin/BroadcastDetailView'));
const AssistantView = React.lazy(() => import('./pages/admin/AssistantView'));
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import RequireAdmin from './components/auth/RequireAdmin';
import AuthoringRoute from './pages/admin/AuthoringRoute';
import AdminComingSoon from './pages/admin/AdminComingSoon';
import CrmListView from './pages/admin/CrmListView';
import CrmDetailView from './pages/admin/CrmDetailView';
import TasksLayout from './pages/admin/TasksLayout';
import CoursePortal from './CoursePortal';
import Home from './pages/Home';
import ConferenceHome from './pages/ConferenceHome';
import About from './pages/About';
import Programs from './pages/Programs';
import Tools from './pages/Tools';
import PhysicianMarriages from './pages/PhysicianMarriages';
import Contact from './pages/Contact';
import Resources from './pages/Resources';
import Frameworks from './pages/Frameworks';
import Testimonials from './pages/Testimonials';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AccountPassword from './pages/AccountPassword';
import CourseOverview from './pages/CourseOverview';
import SparkChallenge from './pages/SparkChallenge';
import Team from './pages/Team';
import ComingSoon from './pages/ComingSoon';
import YourJourney from './pages/YourJourney';
import RescueKit from './pages/RescueKit';
import AdminPanel from './pages/AdminPanel';
import BookCall from './pages/BookCall';
import Apply from './pages/Apply';
import ApplicationSuccess from './pages/ApplicationSuccess';
import WebinarRegister from './pages/WebinarRegister';
import WebinarLive from './pages/WebinarLive';
import WebinarReplay from './pages/WebinarReplay';
import CheckoutSuccess from './pages/CheckoutSuccess';
import MeetTrisha from './pages/MeetTrisha';
import MeetJeff from './pages/MeetJeff';
import Downloads from './portal/Downloads';
import PhedrisComingSoon from './portal/PhedrisComingSoon';
import RescueKitPortal from './portal/RescueKitPortal';
import BookmarksPortal from './portal/BookmarksPortal';
import CalendarPortal from './portal/CalendarPortal';
import JourneyView from './portal/JourneyView';
import ResourcesView from './portal/ResourcesView';
import PortalLayout from './layouts/PortalLayout';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Analytics />
      <AuthProvider>
        <div className="w-full min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-accent/20 selection:text-accent">
          <ErrorBoundary>
          <Routes>
            {/* Main Marketing Site with Layout (Navbar + Footer) */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/conference" element={<ConferenceHome />} />
              <Route path="/expo" element={<ConferenceHome />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/frameworks" element={<Frameworks />} />
              <Route path="/physician" element={<PhysicianMarriages />} />
              <Route path="/physicians" element={<Navigate to="/physician" replace />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/book" element={<BookCall />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund-policy" element={<Refund />} />
              <Route path="/course" element={<CourseOverview />} />
              <Route path="/spark-challenge" element={<SparkChallenge />} />
              <Route path="/team" element={<Team />} />
              <Route path="/journey" element={<YourJourney />} />
              <Route path="/meet/trisha" element={<MeetTrisha />} />
              <Route path="/meet/jeff" element={<MeetJeff />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/enroll" element={<ComingSoon />} />
              <Route path="/enroll/:program" element={<ComingSoon />} />
              <Route path="/rescue-kit" element={<RescueKit />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/webinar" element={<WebinarRegister />} />
              <Route path="/webinar/live" element={<WebinarLive />} />
              <Route path="/webinar/replay" element={<WebinarReplay />} />
              <Route path="/physician-track" element={<ComingSoon />} />
            </Route>

            {/* Portal + Admin routes — PortalLayout (sidebar) */}
            <Route element={<PortalLayout />}>
              {/* Admin routes */}
              <Route path="/admin" element={<RequireAdmin><AdminPanel /></RequireAdmin>} />
              <Route path="/admin/crm" element={<RequireAdmin><CrmListView /></RequireAdmin>} />
              <Route path="/admin/crm/:applicationId" element={<RequireAdmin><CrmDetailView /></RequireAdmin>} />
              <Route path="/admin/tasks" element={<RequireAdmin><TasksLayout /></RequireAdmin>} />
              <Route path="/admin/tasks/kanban" element={<RequireAdmin><TasksLayout /></RequireAdmin>} />
              <Route path="/admin/tasks/list" element={<RequireAdmin><TasksLayout /></RequireAdmin>} />
              <Route path="/admin/authoring" element={<RequireAdmin><AuthoringRoute /></RequireAdmin>} />

              {/* Admin scaffolds — IA declared in Wave 4B drawer; impl deferred to future wave */}
              <Route path="/admin/users" element={<RequireAdmin><AdminComingSoon title="User list" breadcrumb="Users" /></RequireAdmin>} />
              <Route path="/admin/enrollments" element={<RequireAdmin><Suspense fallback={<div className="p-8" /> }><EnrollmentsListView /></Suspense></RequireAdmin>} />
              <Route path="/admin/enrollments/:id" element={<RequireAdmin><Suspense fallback={<div className="p-8" /> }><EnrollmentDetailView /></Suspense></RequireAdmin>} />
              <Route path="/admin/webinars" element={<RequireAdmin><Suspense fallback={<div className="p-8" /> }><WebinarsListView /></Suspense></RequireAdmin>} />
              <Route path="/admin/webinars/:id" element={<RequireAdmin><Suspense fallback={<div className="p-8" /> }><WebinarDetailView /></Suspense></RequireAdmin>} />
              <Route path="/admin/broadcasts" element={<RequireAdmin><Suspense fallback={<div className="p-8" /> }><BroadcastsListView /></Suspense></RequireAdmin>} />
              <Route path="/admin/broadcasts/:broadcast_id" element={<RequireAdmin><Suspense fallback={<div className="p-8" /> }><BroadcastDetailView /></Suspense></RequireAdmin>} />
              <Route path="/admin/content" element={<RequireAdmin><AdminComingSoon title="Modules" breadcrumb="Modules" /></RequireAdmin>} />
              <Route path="/admin/settings" element={<RequireAdmin><AdminComingSoon title="Settings" breadcrumb="Settings" /></RequireAdmin>} />
              <Route path="/admin/assistant" element={<RequireAdmin><Suspense fallback={<div className="p-8" />}><AssistantView /></Suspense></RequireAdmin>} />

              {/* Portal routes */}
              <Route path="/portal/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
              <Route path="/portal/course/:courseSlug" element={<ProtectedRoute><CoursePortal /></ProtectedRoute>} />
              <Route path="/portal/course/:courseSlug/:moduleSlug" element={<ProtectedRoute><CoursePortal /></ProtectedRoute>} />
              <Route path="/portal/course/:courseSlug/:moduleSlug/:lessonSlug" element={<ProtectedRoute><CoursePortal /></ProtectedRoute>} />
              <Route path="/portal" element={<ProtectedRoute><CoursePortal /></ProtectedRoute>} />
              <Route path="/portal/:moduleSlug" element={<ProtectedRoute><CoursePortal /></ProtectedRoute>} />
              <Route path="/portal/:moduleSlug/:lessonSlug" element={<ProtectedRoute><CoursePortal /></ProtectedRoute>} />

              {/* Placeholder portal sections — Round 2 will populate */}
              <Route path="/portal/courses" element={<ProtectedRoute><CoursePortal /></ProtectedRoute>} />
              <Route path="/portal/rescue-kit" element={<ProtectedRoute><RescueKitPortal /></ProtectedRoute>} />
              <Route path="/portal/bookmarks" element={<ProtectedRoute><BookmarksPortal /></ProtectedRoute>} />
              <Route path="/portal/calendar" element={<ProtectedRoute><CalendarPortal /></ProtectedRoute>} />
              <Route path="/phedris-coming-soon" element={<ProtectedRoute><PhedrisComingSoon /></ProtectedRoute>} />
              {/* Wave 9 E1: Home-drawer nav targets — placeholder views per A-11 register */}
              <Route path="/portal/journey" element={<ProtectedRoute><JourneyView /></ProtectedRoute>} />
              <Route path="/portal/resources" element={<ProtectedRoute><ResourcesView /></ProtectedRoute>} />
              <Route path="/account/password" element={<ProtectedRoute><AccountPassword /></ProtectedRoute>} />
            </Route>

            {/* Auth pages (standalone, no navbar/footer) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/apply/success" element={<ApplicationSuccess />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
