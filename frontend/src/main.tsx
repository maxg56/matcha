import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
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
      <BrowserRouter>
      <NotificationButton />
        <div className="min-h-screen bg-background text-foreground">
          {/* <NotificationButton /> */}
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            {/* Legacy routes */}
            <Route path="/Accueil" element={<Accueil />} />
            <Route path="/ConversationPage" element={<ConversationPage />} />
            
            {/* New inscription route */}
            <Route path="/inscription" element={<NewInscriptionPage />} />
            
            {/* Main app routes */}
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/chat/:matchId" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Demo routes */}
            <Route path="/demo" element={<ComponentsDemo />} />
            <Route path="/carousel-demo" element={<CarouselDemo />} />
            
            {/* Default redirect to login for new users, discover for authenticated */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

