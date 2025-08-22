import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import "leaflet/dist/leaflet.css"
import { ThemeProvider } from './contexts/ThemeContext'
import InscriptionPage from './pages/InscriptionPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import EditProfilePage from './pages/EditProfilePage';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { RootRedirect } from './components/RootRedirect';
import { NotificationButton } from './components/Notifications'
import MapPage  from './pages/Map';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <NotificationButton />
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<ProtectedRoute requireAuth={false}><LoginPage /></ProtectedRoute>} />
              <Route path="/inscription" element={<ProtectedRoute requireAuth={false}><InscriptionPage /></ProtectedRoute>} />
            
              {/* Main app routes */}
              <Route path="/app" element={<AuthenticatedLayout />}>
                <Route index element={<Navigate to="discover" replace />} />
                <Route path="discover" element={<DiscoverPage />} />
                <Route path="matches" element={<MatchesPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="chat/:matchId" element={<ChatPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="edit-profile" element={<EditProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="map" element={<MapPage />} />
              </Route>
              {/* Default redirect based on authentication status */}
              <Route path="/" element={<RootRedirect />} />
            </Routes>
          </div>
        </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

