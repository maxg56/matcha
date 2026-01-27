import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import InscriptionPage from '../pages/InscriptionPage';
import { ProtectedRoute } from './auth/ProtectedRoute'
import DiscoverPage from '../pages/DiscoverPage';
import MatchesPage from '../pages/MatchesPage';
import MessagesPage from '../pages/MessagesPage';
import ChatPageWebSocket from '../pages/ChatPageWebSocket';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import SettingsPage from '../pages/SettingsPage';
import EditProfilePage from '../pages/EditProfilePage';
import PremiumPage from '../pages/PremiumPage';
import GoodbyePage from '../pages/GoodbyePage';
import { AuthenticatedLayout } from './layout/AuthenticatedLayout';
import { RootRedirect } from './RootRedirect';
import { NotificationButton } from './Notifications'
import MapPage  from '../pages/Map';
import NotFoundPage from '../pages/NotFoundPage';
import { ToastContainer } from './ui/ToastContainer';
import { useToast } from '../hooks/ui/useToast';

export function AppWrapper() {
  const { toasts, removeToast } = useToast();

  return (
    <>
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
            <Route path="/goodbye" element={<GoodbyePage />} />

            {/* Main app routes */}
            <Route path="/app" element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="discover" replace />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="matches" element={<MatchesPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="chat/:matchId" element={<ChatPageWebSocket />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="edit-profile" element={<EditProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="premium" element={<PremiumPage />} />
              <Route path="map" element={<MapPage />} />
            </Route>
            {/* Default redirect based on authentication status */}
            <Route path="/" element={<RootRedirect />} />
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}