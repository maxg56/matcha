import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import Accueil from './pages/Accueil';
import InscriptionPage from './pages/InscriptionPage';
import ConversationPage from './pages/ConversationPage';
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import EditProfilePage from './pages/EditProfilePage';
import { NotificationButton } from './components/Notifications';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <NotificationButton />
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/inscription" element={<InscriptionPage />} />
            
            {/* Main app routes */}
            <Route path="/app/*">
              <ProtectedRoute requireAuth={false}>
                <Routes>
                  <Route index element={<Navigate to="discover" replace />} />
                  <Route path="discover" element={<DiscoverPage />} />
                  <Route path="matches" element={<MatchesPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="chat/:matchId" element={<ChatPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="edit-profile" element={<EditProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </ProtectedRoute>
            </Route>
            

            {/* Default redirect to login for new users, discover for authenticated */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

