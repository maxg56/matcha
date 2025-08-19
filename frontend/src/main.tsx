import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Accueil from './pages/Accueil';
import NewInscriptionPage from './pages/InscriptionPage';
import ConversationPage from './pages/ConversationPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import SettingsPage from './pages/SettingsPage';
import EditProfilePage from './pages/EditProfilePage';
import ComponentsDemo from './components/demo/ComponentsDemo';
import CarouselDemo from './pages/CarouselDemo';
import { NotificationButton } from './components/Notifications';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          {/* <NotificationButton /> */}
          <Routes>
            {/* Auth routes - accessible only when not authenticated */}
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } />
            <Route path="/inscription" element={
              <ProtectedRoute requireAuth={false}>
                <NewInscriptionPage />
              </ProtectedRoute>
            } />
            {/* <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } /> */}
            
            
            {/* Protected main app routes */}
            <Route path="/discover" element={
              <ProtectedRoute>
                <DiscoverPage />
              </ProtectedRoute>
            } />
            <Route path="/matches" element={
              <ProtectedRoute>
                <MatchesPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/chat/:matchId" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            {/* Legacy routes */}
            <Route path="/Accueil" element={<Accueil />} />
            <Route path="/ConversationPage" element={<ConversationPage />} />
            
            {/* Demo routes */}
            <Route path="/demo" element={<ComponentsDemo />} />
            <Route path="/carousel-demo" element={<CarouselDemo />} /> 
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/discover" replace />} />
          </Routes>
        </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

