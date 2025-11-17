/**
 * App - Componente principale dell'applicazione
 * 
 * Configurazione:
 * - Router per navigazione tra pagine
 * - Provider per Context (Auth, Tasks)
 * - Protected Routes per Dashboard
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

/**
 * ProtectedRoute - Componente per proteggere route che richiedono autenticazione
 * 
 * Se l'utente non è autenticato, reindirizza alla pagina di login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mentre verifica il token, mostra un loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-planner-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planner-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se non autenticato, redirect al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se autenticato, mostra il contenuto
  return children;
};

/**
 * PublicRoute - Route accessibili solo se NON autenticati
 * Se l'utente è già loggato, redirect alla dashboard
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-planner-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planner-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se già autenticato, redirect alla dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se non autenticato, mostra la pagina pubblica
  return children;
};

/**
 * AppRoutes - Configurazione delle route
 * (componente separato per poter usare useAuth all'interno di BrowserRouter)
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route pubblica: Login/Register */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Route protetta: Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect a / se la route non esiste */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * App - Componente root
 * Wrappa l'app con i Provider necessari
 */
function App() {
  return (
    <BrowserRouter>
      {/* Provider per autenticazione */}
      <AuthProvider>
        {/* Provider per impostazioni utente */}
        <SettingsProvider>
          {/* Provider per tasks (deve essere dentro AuthProvider per accedere a isAuthenticated) */}
          <TaskProvider>
            <AppRoutes />
          </TaskProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

