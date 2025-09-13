import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import "leaflet/dist/leaflet.css"
import { ThemeProvider } from './contexts/ThemeContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { StripeProvider } from './contexts/StripeContext'
import InscriptionPage from './pages/InscriptionPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SettingsPage from './pages/SettingsPage';
import EditProfilePage from './pages/EditProfilePage';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { RootRedirect } from './components/RootRedirect';
import { NotificationButton } from './components/Notifications'
import MapPage  from './pages/Map';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <WebSocketProvider>
        <StripeProvider>
        <BrowserRouter>
          <NotificationButton />
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<ProtectedRoute requireAuth={false}><LoginPage /></ProtectedRoute>} />
                <Route path="/connexion" element={<ProtectedRoute requireAuth={false}><LoginPage /></ProtectedRoute>} />
                <Route path="/inscription" element={<InscriptionPage />} />
                <Route path="/mot-de-passe-oublie" element={<ProtectedRoute requireAuth={false}><ForgotPasswordPage /></ProtectedRoute>} />
                <Route path="/reinitialiser-mot-de-passe" element={<ProtectedRoute requireAuth={false}><ResetPasswordPage /></ProtectedRoute>} />
              
                {/* Main app routes */}
                <Route path="/app" element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="discover" replace />} />
                  <Route path="discover" element={<DiscoverPage />} />
                  <Route path="matches" element={<MatchesPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="chat/:matchId" element={<ChatPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="edit-profile" element={<EditProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="map" element={<MapPage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                  <Route path="subscription/success" element={<SubscriptionSuccessPage />} />
                </Route>
                {/* Default redirect based on authentication status */}
                <Route path="/" element={<RootRedirect />} />
              </Routes>
            </div>
          </BrowserRouter>
        </StripeProvider>
      </WebSocketProvider>
    </ThemeProvider>
  </StrictMode>,
)

