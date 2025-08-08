import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-white">
        <App />
      </div>
    </div>
  </StrictMode>
)
