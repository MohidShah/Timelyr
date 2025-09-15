import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardLayout } from './components/Dashboard/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { LinkViewPage } from './pages/LinkViewPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { getUserProfile } from './lib/profile';
import { MockDataIndicator } from './components/MockDataIndicator';
import { SecurityHeaders } from './components/SecurityHeaders';
import { MaintenanceMode } from './components/ui/MaintenanceMode';
import { CookieConsent } from './components/ui/CookieConsent';
import { ToastProvider } from './components/ui/Toast';
import { monitoring, trackUserSession } from './lib/monitoring';
import { checkRateLimit, SECURITY_CONFIG } from './lib/security';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading Timelyr...</p>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    // Check if cookie consent is needed
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowCookieConsent(true);
    }
  }, []);

  const handleCookieConsent = (preferences: any) => {
    setShowCookieConsent(false);
    
    // Initialize analytics based on consent
    if (preferences.analytics) {
      // Initialize analytics tracking
      console.log('Analytics enabled');
    }
    
    if (preferences.marketing) {
      // Initialize marketing pixels
      console.log('Marketing cookies enabled');
    }
  };

  useEffect(() => {
    // Check maintenance mode
    if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
      setMaintenanceMode(true);
      setLoading(false);
      setInitialized(true);
      return;
    }

    const initializeApp = async () => {
      try {
        // Check if Supabase is configured
        const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
        const useMockMode = !hasSupabaseConfig || import.meta.env.VITE_USE_MOCK_DB === 'true';

        if (useMockMode) {
          console.warn('Running in demo mode with mock data');
          setLoading(false);
          setInitialized(true);
          
          // Track user session if authenticated
          if (session?.user) {
            trackUserSession(session.user.id);
          }
          return;
        }

        // Try to get session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        try {
          const { data: { session }, error: sessionError } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;
          
          if (sessionError) {
            console.warn('Session error, continuing without user:', sessionError);
            setUser(null);
            setUserProfile(null);
          } else {
            setUser(session?.user ?? null);
            
            if (session?.user) {
              try {
                await fetchUserProfile(session.user.id);
              } catch (profileError) {
                console.warn('Profile fetch error, continuing without profile:', profileError);
                setUserProfile(null);
              }
            }
          }
        } catch (timeoutError) {
          console.warn('Session fetch timed out, continuing in demo mode');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.warn('App initialization error, continuing in demo mode:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeApp();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await fetchUserProfile(session.user.id);
          } catch (error) {
            console.warn('Auth state change profile error:', error);
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.warn('Auth state change error:', error);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.warn('Error fetching user profile:', error);
      setUserProfile(null);
      throw error; // Re-throw to be handled by caller
    }
  };

  if (loading || !initialized) {
    return <LoadingSpinner />;
  }

  // Show maintenance mode if enabled
  if (maintenanceMode) {
    return (
      <>
        <SecurityHeaders />
        <MaintenanceMode />
      </>
    );
  }

  return (
    <ToastProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <SecurityHeaders />
        <Router>
          <MockDataIndicator />
          {showCookieConsent && (
            <CookieConsent onAccept={handleCookieConsent} />
          )}
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard/*" element={
              user ? (
                <DashboardLayout user={user} userProfile={userProfile}>
                  <Routes>
                    <Route index element={<DashboardPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                  </Routes>
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } />
            
            <Route path="/profile" element={
              user ? (
                <DashboardLayout user={user} userProfile={userProfile}>
                  <ProfilePage />
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } />

            {/* Public Routes */}
            <Route path="/*" element={
              <div className="min-h-screen bg-white">
                <Navbar user={user} userProfile={userProfile} />
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/link/:slug" element={<LinkViewPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                  </Routes>
                </Suspense>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
      </Suspense>
    </ToastProvider>
  );
}

export default App;