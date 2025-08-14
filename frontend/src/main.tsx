import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Accueil from './pages/Accueil';
import InscriptionPage from './pages/InscriptionPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/InscriptionPage" element={<InscriptionPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
