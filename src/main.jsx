import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ FIX: Removed AuthProvider, ProductProvider, OrderProvider from here.
// App.jsx already wraps everything in those providers — having them here too
// caused a context conflict that broke the entire app (white screen).

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)