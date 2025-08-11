import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <body>
      <button>Click me</button>
      <h1>Hello, world!</h1>
    </body>
  </StrictMode>,
)
