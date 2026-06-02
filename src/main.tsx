import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { initAnalyticsBridge } from './services/analyticsBridge'
import './styles/globals.css'

// Подключаем воронку аналитики (события трекаются только при наличии consent).
initAnalyticsBridge()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
