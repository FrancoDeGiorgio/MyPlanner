/**
 * Client API Axios configurato per comunicare con il backend FastAPI
 * 
 * Questo file gestisce:
 * - La creazione di un'istanza Axios preconfigurata
 * - L'inserimento automatico del token JWT nelle richieste
 * - La gestione degli errori 401 (non autenticato) con refresh automatico
 * 
 * Security: Access token salvato in memory (non localStorage) per protezione XSS
 * Refresh token gestito tramite httpOnly cookie dal backend
 */

import axios from 'axios';

// URL base dell'API backend (modificare con l'URL di produzione su Render)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Storage in-memory per access token (non persistente, sicuro da XSS)
 * Il token viene perso al refresh della pagina, ma è più sicuro di localStorage
 */
let accessTokenMemory = null;

/**
 * Funzione per settare l'access token in memory
 */
export const setAccessToken = (token) => {
  accessTokenMemory = token;
};

/**
 * Funzione per ottenere l'access token da memory
 */
export const getAccessToken = () => {
  return accessTokenMemory;
};

/**
 * Funzione per rimuovere l'access token da memory
 */
export const clearAccessToken = () => {
  accessTokenMemory = null;
};

/**
 * Istanza Axios personalizzata con configurazione base
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Necessario per inviare httpOnly cookies
});

/**
 * Funzione helper per leggere un cookie
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * Interceptor per le richieste: aggiunge automaticamente il token JWT e CSRF
 * Il token viene recuperato da memory (non localStorage) per sicurezza
 */
apiClient.interceptors.request.use(
  (config) => {
    // Recupera il token JWT da memory (non localStorage per sicurezza XSS)
    const token = getAccessToken();
    
    if (token) {
      // Aggiunge il token nell'header Authorization con formato "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Aggiunge il token CSRF per le richieste state-changing (POST, PUT, DELETE, PATCH)
    // Il token CSRF viene inviato dal backend come cookie XSRF-TOKEN
    // e deve essere letto e inviato nell'header X-XSRF-TOKEN
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor per le risposte: gestisce errori 401 (non autenticato) e CSRF token
 * Se riceve un 401, tenta refresh automatico del token usando il refresh token nel cookie
 * Se riceve un 403 CSRF, ottiene il token CSRF e riprova la richiesta
 */
apiClient.interceptors.response.use(
  (response) => {
    // Se la risposta è OK, verifica se contiene un nuovo token CSRF nell'header
    // Il backend può inviare il token CSRF nell'header X-XSRF-TOKEN
    const csrfToken = response.headers['x-xsrf-token'];
    if (csrfToken) {
      // Il token CSRF è già nel cookie, non serve fare nulla
      // Il cookie viene gestito automaticamente dal browser
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Se riceve un errore 403 CSRF e non è già un retry
    if (error.response && error.response.status === 403 && 
        error.response.data?.detail?.includes('CSRF') && 
        !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      
      try {
        // Ottiene il token CSRF facendo una richiesta GET a un endpoint qualsiasi
        // Il backend invierà il token CSRF nel cookie nella risposta
        await axios.get(`${API_BASE_URL}/health`, { withCredentials: true });
        
        // Riprova la richiesta originale con il token CSRF dal cookie
        const csrfToken = getCookie('XSRF-TOKEN');
        if (csrfToken) {
          originalRequest.headers['X-XSRF-TOKEN'] = csrfToken;
        }
        
        return apiClient(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }
    
    // Se riceve un errore 401 (Unauthorized) e non è già un retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tenta refresh del token usando il refresh token nel cookie httpOnly
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }  // Invia cookie httpOnly
        );
        
        // Salva il nuovo access token in memory
        const newAccessToken = refreshResponse.data.access_token;
        setAccessToken(newAccessToken);
        
        // Riprova la richiesta originale con il nuovo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Aggiunge anche il token CSRF se presente
        const csrfToken = getCookie('XSRF-TOKEN');
        if (csrfToken) {
          originalRequest.headers['X-XSRF-TOKEN'] = csrfToken;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh fallito: rimuove token e reindirizza al login
        clearAccessToken();
        
        // Reindirizza alla pagina di login (se non ci siamo già)
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

