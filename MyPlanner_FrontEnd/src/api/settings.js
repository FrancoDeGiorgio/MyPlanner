/**
 * API Settings - Gestione preferenze utente.
 */

import apiClient from './client';

export const getUserSettings = async () => {
  const response = await apiClient.get('/settings');
  return response.data;
};

export const updateUserSettings = async (payload) => {
  const response = await apiClient.put('/settings', payload);
  return response.data;
};


