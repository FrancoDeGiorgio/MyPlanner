/**
 * API Auth - Funzioni per autenticazione (login, register)
 * 
 * Queste funzioni gestiscono le chiamate agli endpoint di autenticazione del backend.
 */

import apiClient from './client';

// Configurazione per inviare cookie httpOnly
const axiosConfig = {
  withCredentials: true  // Necessario per inviare/recevere httpOnly cookies
};

/**
 * Registra un nuovo utente
 * 
 * @param {string} name_user - Nome utente (deve essere unico)
 * @param {string} password - Password dell'utente
 * @returns {Promise} Promise con i dati della risposta
 */
export const registerUser = async (name_user, password) => {
  const response = await apiClient.post('/auth/register', {
    name_user,
    password,
  });
  return response.data;
};

/**
 * Esegue il login
 * 
 * Il backend richiede i dati in formato form-data (OAuth2PasswordRequestForm)
 * quindi usiamo URLSearchParams invece di JSON
 * 
 * @param {string} username - Nome utente
 * @param {string} password - Password
 * @returns {Promise} Promise con il token JWT
 */
export const loginUser = async (username, password) => {
  // Crea form data per OAuth2
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await apiClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...axiosConfig  // Invia cookie httpOnly
  });
  
  return response.data; // Ritorna { access_token, token_type }
};

