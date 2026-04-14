import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// TEST DI EMERGENZA
console.log("Script main.jsx caricato correttamente!");
document.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    console.log("Elemento root trovato!");
    // Se React fallisce, almeno vedremo questa scritta
    rootEl.innerHTML = '<div style="background:red; color:white; padding:20px; text-align:center; font-size:30px; font-weight:bold;">CRM CARICATO (TEST JS OK)</div>';
  }
});

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
