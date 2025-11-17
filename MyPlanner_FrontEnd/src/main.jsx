/**
 * Entry point dell'applicazione React
 * 
 * Questo file è il punto di ingresso principale dell'applicazione.
 * Qui viene montato il componente App nel DOM e vengono importati gli stili globali.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Monta l'applicazione React nel div con id="root" presente in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

