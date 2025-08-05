import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isDashboardRoute = (pathname: string) => {
    return pathname.startsWith('/dashboard') || pathname === '/profile';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
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
            <div className="min-h-screen bg-white">
              <Navbar />
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Please sign in to access the dashboard
                  </h1>
                </div>
              </div>
              <Footer />
            </div>
          )
        } />
        
        <Route path="/profile" element={
          user ? (
            <DashboardLayout user={user} userProfile={userProfile}>
              <ProfilePage />
            </DashboardLayout>
          ) : (
            <div className="min-h-screen bg-white">
              <Navbar />
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Please sign in to access your profile
                  </h1>
                </div>
              </div>
              <Footer />
            </div>
          )
        } />

        {/* Public Routes */}
        <Route path="/*" element={
          <div className="min-h-screen bg-white">
            <Navbar />
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
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;