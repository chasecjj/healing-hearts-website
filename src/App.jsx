import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import RequireAdmin from './components/auth/RequireAdmin';
import CrmListView from './pages/admin/CrmListView';
import CrmDetailView from './pages/admin/CrmDetailView';
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
import Downloads from './portal/Downloads';
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
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/enroll" element={<ComingSoon />} />
              <Route path="/enroll/:program" element={<ComingSoon />} />
              <Route path="/rescue-kit" element={<RescueKit />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/webinar" element={<WebinarRegister />} />
              <Route path="/webinar/live" element={<WebinarLive />} />
              <Route path="/webinar/replay" element={<WebinarReplay />} />
              <Route path="/physician-track" element={<ComingSoon />} />
              <Route path="/admin" element={<RequireAdmin><AdminPanel /></RequireAdmin>} />
              <Route path="/admin/crm" element={<RequireAdmin><CrmListView /></RequireAdmin>} />
              <Route path="/admin/crm/:applicationId" element={<RequireAdmin><CrmDetailView /></RequireAdmin>} />
            </Route>

            {/* Auth pages (standalone, no navbar/footer) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/apply/success" element={<ApplicationSuccess />} />

            {/* Protected: Downloads (must come before parameterized portal routes) */}
            <Route
              path="/portal/downloads"
              element={
                <ProtectedRoute>
                  <Downloads />
                </ProtectedRoute>
              }
            />

            {/* Protected: Course Portal — course-scoped routes */}
            <Route
              path="/portal/course/:courseSlug"
              element={
                <ProtectedRoute>
                  <CoursePortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/course/:courseSlug/:moduleSlug"
              element={
                <ProtectedRoute>
                  <CoursePortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/course/:courseSlug/:moduleSlug/:lessonSlug"
              element={
                <ProtectedRoute>
                  <CoursePortal />
                </ProtectedRoute>
              }
            />

            {/* Protected: Course Portal — legacy routes (default to healing-hearts-journey) */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <CoursePortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/:moduleSlug"
              element={
                <ProtectedRoute>
                  <CoursePortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/:moduleSlug/:lessonSlug"
              element={
                <ProtectedRoute>
                  <CoursePortal />
                </ProtectedRoute>
              }
            />

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
