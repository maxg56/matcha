import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Accueil from './pages/Accueil';
import InscriptionPage from './pages/InscriptionPage';
import ConversationPage from './pages/ConversationPage';
import { NotificationButton } from './components/Notifications';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationButton />
      <Routes>
        <Route path="/Accueil" element={<Accueil />} />
        <Route path="/InscriptionPage" element={<InscriptionPage />} />
        <Route path="/ConversationPage" element={<ConversationPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
