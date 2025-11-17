import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUserSettings, updateUserSettings } from '../api/settings';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);
const DEFAULT_ACCENT_COLOR = '#7A5BFF';

const computeAccentForeground = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string') {
    return '#FFFFFF';
  }
  const hex = hexColor.replace('#', '');
  const bigint = parseInt(hex, 16);
  if (Number.isNaN(bigint)) {
    return '#FFFFFF';
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#1E1E2F' : '#FFFFFF';
};

export const SettingsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserSettings();
      setSettings(data);
    } catch (err) {
      console.error('Errore nel recupero delle impostazioni utente:', err);
      setError('Impossibile caricare le impostazioni utente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const saveSettings = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateUserSettings(payload);
      setSettings(updated);
      return updated;
    } catch (err) {
      console.error('Errore nell\'aggiornamento delle impostazioni utente:', err);
      setError('Impossibile aggiornare le impostazioni utente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(() => {
    return {
      settings,
      accentColor: settings?.accent_color ?? DEFAULT_ACCENT_COLOR,
      accentForeground: computeAccentForeground(settings?.accent_color ?? DEFAULT_ACCENT_COLOR),
      theme: settings?.theme ?? 'light',
      language: settings?.language ?? 'it',
      loading,
      error,
      refreshSettings: loadSettings,
      updateSettings: saveSettings,
    };
  }, [settings, loading, error]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve essere utilizzato all\'interno di un SettingsProvider');
  }
  return context;
};


