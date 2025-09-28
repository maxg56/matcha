import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "leaflet/dist/leaflet.css"
import { ThemeProvider } from './contexts/ThemeContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { StripeProvider } from './contexts/StripeContext'
import { AppWrapper } from './components/AppWrapper'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <WebSocketProvider>
        <StripeProvider>
          <AppWrapper />
        </StripeProvider>
      </WebSocketProvider>
    </ThemeProvider>
  </StrictMode>,
)

