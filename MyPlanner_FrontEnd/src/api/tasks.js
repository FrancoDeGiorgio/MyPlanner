/**
 * API Tasks - Funzioni CRUD per le attività
 * 
 * Queste funzioni gestiscono tutte le operazioni sulle tasks:
 * - Recupero lista tasks
 * - Creazione nuova task
 * - Aggiornamento task esistente
 * - Eliminazione task
 */

import apiClient from './client';

/**
 * Recupera tutte le tasks dell'utente autenticato
 * 
 * @returns {Promise<Array>} Array di tasks filtrate dall'RLS per l'utente corrente
 */
export const getTasks = async () => {
  const response = await apiClient.get('/tasks');
  return response.data;
};

/**
 * Crea una nuova task
 * 
 * @param {Object} taskData - Dati della task
 * @param {string} taskData.title - Titolo della task
 * @param {string} taskData.description - Descrizione della task
 * @param {string} taskData.color - Colore scelto (es: "green")
 * @param {string} taskData.date_time - Data/ora inizio in formato ISO
 * @param {string} [taskData.end_time] - Data/ora fine in formato ISO (opzionale)
 * @param {number} [taskData.duration_minutes] - Durata in minuti (alternativa a end_time)
 * @param {boolean} taskData.completed - Stato completamento (default: false)
 * @returns {Promise<Object>} Task creata con tutti i campi (incluso id)
 */
export const createTask = async (taskData) => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
};

/**
 * Aggiorna una task esistente
 * 
 * @param {string} taskId - UUID della task da aggiornare
 * @param {Object} taskData - Dati aggiornati
 * @param {string} taskData.title - Nuovo titolo
 * @param {string} taskData.description - Nuova descrizione
 * @param {string} taskData.color - Nuovo colore
 * @param {string} taskData.date_time - Nuova data/ora di inizio
 * @param {string} [taskData.end_time] - Nuova data/ora di fine (opzionale)
 * @param {number} [taskData.duration_minutes] - Nuova durata in minuti (alternativa a end_time)
 * @param {boolean} taskData.completed - Nuovo stato
 * @returns {Promise<Object>} Task aggiornata
 */
export const updateTask = async (taskId, taskData) => {
  const response = await apiClient.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

/**
 * Elimina una task
 * 
 * @param {string} taskId - UUID della task da eliminare
 * @returns {Promise<void>} Promise vuota (status 204)
 */
export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

