import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import SignupPage    from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFoundPage  from './pages/NotFoundPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-mesh flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/"              element={<LandingPage />} />
    <Route path="/login"         element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup"        element={<PublicRoute><SignupPage /></PublicRoute>} />
    <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/analytics/:urlId" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
    <Route path="/not-found"     element={<NotFoundPage type="url" />} />
    <Route path="/expired"       element={<NotFoundPage type="expired" />} />
    <Route path="*"              element={<NotFoundPage type="page" />} />
  </Routes>
);

/* Toaster adapts to theme */
const ThemedToaster = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#1e1b2e' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#0f172a',
          border: isDark ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(0,0,0,0.08)',
          borderRadius: '12px',
          fontSize: '14px',
          boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.1)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
