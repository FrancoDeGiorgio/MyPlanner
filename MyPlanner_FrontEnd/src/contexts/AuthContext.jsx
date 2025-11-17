/**
 * AuthContext - Context per la gestione dell'autenticazione
 * 
 * Questo Context fornisce a tutta l'applicazione:
 * - Stato di autenticazione (user, isAuthenticated)
 * - Funzioni per login, logout, register
 * - Access token salvato in memory (non localStorage) per sicurezza XSS
 * - Refresh token gestito tramite httpOnly cookie dal backend
 * 
 * Uso:
 * - Wrappa l'app con <AuthProvider>
 * - Usa useAuth() hook nei componenti per accedere allo stato
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../api/auth';
import { setAccessToken, getAccessToken, clearAccessToken } from '../api/client';

// Crea il Context
const AuthContext = createContext(null);

/**
 * Provider del Context di autenticazione
 * Gestisce lo stato globale dell'autenticazione
 */
export const AuthProvider = ({ children }) => {
  // Stato: username dell'utente autenticato (null se non loggato)
  const [user, setUser] = useState(null);
  
  // Stato: indica se stiamo caricando (per verificare il token al mount)
  const [loading, setLoading] = useState(true);

  /**
   * Effetto al mount: verifica se c'è un token in memory e ottiene il token CSRF
   * Nota: Il token in memory si perde al refresh della pagina per sicurezza
   * L'utente dovrà rifare login o il refresh token nel cookie verrà usato automaticamente
   */
  useEffect(() => {
    const initializeAuth = async () => {
      // Ottiene il token CSRF facendo una richiesta GET iniziale
      // Il backend invierà il token CSRF nel cookie nella risposta
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/health`, {
          method: 'GET',
          credentials: 'include',  // Include cookie per ottenere CSRF token
        });
      } catch (error) {
        // Ignora errori nella richiesta iniziale (non critico)
        console.warn('Failed to initialize CSRF token:', error);
      }
      
      const token = getAccessToken();
      
      if (token) {
        // Token presente in memory: considera l'utente autenticato
        // Nota: username non è più persistito, potrebbe essere estratto dal token JWT se necessario
        setUser('authenticated');  // Placeholder, potrebbe essere estratto dal token
      }
      
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  /**
   * Funzione di login
   * 
   * @param {string} username - Nome utente
   * @param {string} password - Password
   * @returns {Promise<void>}
   * @throws {Error} Se le credenziali sono errate
   */
  const login = async (username, password) => {
    try {
      // Chiama l'API di login (refresh token viene settato automaticamente in httpOnly cookie)
      const data = await loginUser(username, password);
      
      // Salva l'access token in memory (non localStorage per sicurezza XSS)
      setAccessToken(data.access_token);
      
      // Aggiorna lo stato
      setUser(username);
      
      return { success: true };
    } catch (error) {
      // Gestisce errori (es: 401 credenziali errate)
      const message = error.response?.data?.detail || 'Errore durante il login';
      throw new Error(message);
    }
  };

  /**
   * Funzione di registrazione
   * 
   * @param {string} name_user - Nome utente (deve essere unico)
   * @param {string} password - Password
   * @returns {Promise<void>}
   * @throws {Error} Se lo username esiste già
   */
  const register = async (name_user, password) => {
    try {
      // Chiama l'API di registrazione
      await registerUser(name_user, password);
      
      // Dopo la registrazione, fa automaticamente login
      await login(name_user, password);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Errore durante la registrazione';
      throw new Error(message);
    }
  };

  /**
   * Funzione di logout
   * Rimuove il token da memory e resetta lo stato
   * Nota: Il refresh token nel cookie httpOnly dovrebbe essere revocato lato backend
   */
  const logout = () => {
    // Rimuove il token da memory
    clearAccessToken();
    
    // TODO: Chiamare endpoint logout per revocare refresh token nel cookie
    // await apiClient.post('/auth/logout');
    
    // Resetta lo stato
    setUser(null);
  };

  // Valore fornito dal Context a tutti i componenti figli
  const value = {
    user,                            // Username dell'utente (null se non loggato)
    isAuthenticated: !!user,         // Boolean: true se l'utente è autenticato
    loading,                         // Boolean: true durante il caricamento iniziale
    login,                           // Funzione per fare login
    register,                        // Funzione per registrarsi
    logout,                          // Funzione per fare logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizzato per usare l'AuthContext
 * 
 * @returns {Object} Oggetto con user, isAuthenticated, login, register, logout
 * 
 * Esempio d'uso:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  
  return context;
};

