import React, { Component, ErrorInfo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import InstallPrompt from './components/InstallPrompt';
import Navigation from './components/Navigation';
import { initPushNotifications } from './utils/push';

import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Camera from './pages/Camera';
import Wallet from './pages/Wallet';
import Trending from './pages/Trending';
import Search from './pages/Search';
import PublicProfile from './pages/PublicProfile';
import Chat from './pages/Chat';
import ChatRoom from './pages/ChatRoom';
import Settings from './pages/Settings';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Caught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <div style={{ background: '#000', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><button onClick={() => window.location.reload()} style={{ padding: 20, borderRadius: 20 }}>רענן עמוד</button></div>;
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ background: '#000', height: '100vh' }} />;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/camera" element={<ProtectedRoute><Camera /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/trending" element={<ProtectedRoute><Trending /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/u/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
}

function MainLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const hideNav = location.pathname === '/auth' || location.pathname === '/camera' || location.pathname.startsWith('/chat/');

  // מפעיל את בקשת ההתראות ברגע שהמשתמש מחובר!
  useEffect(() => {
    if (user) {
      initPushNotifications();
    }
  }, [user]);

  return (
    <>
      <AppRoutes />
      {user && !hideNav && <Navigation />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainLayout />
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: 'rgba(25,25,30,0.9)', color: '#fff', borderRadius: 20, padding: '16px 24px', fontWeight: 700 } }} />
        <InstallPrompt />
      </AuthProvider>
    </ErrorBoundary>
  );
}
