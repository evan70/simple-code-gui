import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { VoiceProvider } from './contexts/VoiceContext'
import './styles.css'

// Suppress Vite dev server reconnection errors (expected when dev server stops)
if (import.meta.env.DEV) {
  const originalError = console.error
  console.error = (...args) => {
    const msg = args[0]?.toString?.() || ''
    // Filter out Vite reconnection spam
    if (msg.includes('net::ERR_CONNECTION_REFUSED') ||
        msg.includes('[vite]') ||
        msg.includes('localhost:5173')) {
      return
    }
    originalError.apply(console, args)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VoiceProvider>
      <App />
    </VoiceProvider>
  </React.StrictMode>
)
