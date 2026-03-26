import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CoursePortal from './CoursePortal';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Tools from './pages/Tools';
import PhysicianMarriages from './pages/PhysicianMarriages';
import Physicians from './pages/Physicians';
import Contact from './pages/Contact';
import Resources from './pages/Resources';
import Frameworks from './pages/Frameworks';
import Testimonials from './pages/Testimonials';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
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

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <div className="w-full min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-accent/20 selection:text-accent">
          <Routes>
            {/* Main Marketing Site with Layout (Navbar + Footer) */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/frameworks" element={<Frameworks />} />
              <Route path="/physician" element={<PhysicianMarriages />} />
              <Route path="/physicians" element={<Physicians />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/book" element={<BookCall />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/course" element={<CourseOverview />} />
              <Route path="/spark-challenge" element={<SparkChallenge />} />
              <Route path="/team" element={<Team />} />
              <Route path="/journey" element={<YourJourney />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/enroll" element={<ComingSoon />} />
              <Route path="/enroll/:program" element={<ComingSoon />} />
              <Route path="/rescue-kit" element={<RescueKit />} />
              <Route path="/webinar" element={<WebinarRegister />} />
              <Route path="/webinar/live" element={<WebinarLive />} />
              <Route path="/webinar/replay" element={<WebinarReplay />} />
              <Route path="/physician-track" element={<ComingSoon />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* Auth pages (standalone, no navbar/footer) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/apply/success" element={<ApplicationSuccess />} />

            {/* Protected: Course Portal (URL-driven lesson navigation) */}
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
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
