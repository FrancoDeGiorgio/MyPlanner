/**
 * TaskContext - Context per la gestione delle tasks
 * 
 * Questo Context fornisce:
 * - Lista di tutte le tasks dell'utente
 * - Funzioni CRUD (create, update, delete)
 * - Sincronizzazione automatica con il backend
 * 
 * Uso:
 * - Wrappa i componenti con <TaskProvider>
 * - Usa useTasks() hook per accedere alle tasks e alle funzioni
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useAuth } from './AuthContext';

// Crea il Context
const TaskContext = createContext(null);

/**
 * Provider del Context delle tasks
 */
export const TaskProvider = ({ children }) => {
  // Stato: lista di tutte le tasks
  const [tasks, setTasks] = useState([]);
  
  // Stato: indica se stiamo caricando i dati
  const [loading, setLoading] = useState(false);
  
  // Stato: errore eventuale
  const [error, setError] = useState(null);
  
  // Accede al context di autenticazione
  const { isAuthenticated } = useAuth();

  /**
   * Effetto: carica le tasks quando l'utente è autenticato
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      // Se l'utente fa logout, svuota le tasks
      setTasks([]);
    }
  }, [isAuthenticated]);

  /**
   * Recupera tutte le tasks dal backend
   */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError('Errore nel caricamento delle tasks');
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea una nuova task
   * 
   * @param {Object} taskData - Dati della nuova task
   * @param {string} taskData.title - Titolo
   * @param {string} taskData.description - Descrizione
   * @param {string} taskData.color - Colore selezionato
   * @param {string} taskData.date_time - Data/ora di inizio (ISO)
   * @param {string} [taskData.end_time] - Data/ora di fine (ISO)
   * @param {number} [taskData.duration_minutes] - Durata in minuti
   * @param {boolean} taskData.completed - Stato completamento
   * @returns {Promise<Object>} Task creata
   */
  const addTask = async (taskData) => {
    try {
      // Chiama l'API per creare la task
      const newTask = await createTask(taskData);
      
      // Aggiunge la task allo stato locale
      setTasks((prevTasks) => [...prevTasks, newTask]);
      
      return newTask;
    } catch (err) {
      console.error('Create task error:', err);
      throw err;
    }
  };

  /**
   * Aggiorna una task esistente
   * 
   * @param {string} taskId - ID della task
   * @param {Object} taskData - Dati aggiornati (stessa forma di TaskBase)
   * @returns {Promise<Object>} Task aggiornata
   */
  const editTask = async (taskId, taskData) => {
    try {
      // Chiama l'API per aggiornare
      const updatedTask = await updateTask(taskId, taskData);
      
      // Aggiorna lo stato locale
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      );
      
      return updatedTask;
    } catch (err) {
      console.error('Update task error:', err);
      throw err;
    }
  };

  /**
   * Elimina una task
   * 
   * @param {string} taskId - ID della task da eliminare
   * @returns {Promise<void>}
   */
  const removeTask = async (taskId) => {
    try {
      // Chiama l'API per eliminare
      await deleteTask(taskId);
      
      // Rimuove la task dallo stato locale
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
    } catch (err) {
      console.error('Delete task error:', err);
      throw err;
    }
  };

  /**
   * Togg le stato di completamento di una task
   * 
   * @param {string} taskId - ID della task
   * @returns {Promise<void>}
   */
  const toggleTaskComplete = async (taskId) => {
    // Trova la task nello stato locale
    const task = tasks.find((t) => t.id === taskId);
    
    if (!task) return;
    
    // Inverte lo stato completed
    const updatedData = {
      title: task.title,
      description: task.description,
      color: task.color,
      date_time: task.date_time,
      end_time: task.end_time,
      duration_minutes: task.duration_minutes,
      completed: !task.completed,
    };
    
    await editTask(taskId, updatedData);
  };

  /**
   * Aggiorna parzialmente una task (utile per salvataggio efficiente)
   * 
   * @param {string} taskId - ID della task
   * @param {Object} partialData - Dati parziali da aggiornare
   * @returns {Promise<Object>} Task aggiornata
   */
  const updateTaskPartial = async (taskId, partialData) => {
    try {
      // Trova la task corrente
      const task = tasks.find((t) => t.id === taskId);
      
      if (!task) {
        throw new Error('Task non trovata');
      }
      
      // Merge dei dati esistenti con quelli nuovi
      const updatedData = {
        title: task.title,
        description: task.description,
        color: task.color,
        date_time: task.date_time,
        end_time: task.end_time,
        duration_minutes: task.duration_minutes,
        completed: task.completed,
        ...partialData, // Sovrascrive solo i campi forniti
      };
      
      // Usa la funzione editTask esistente
      return await editTask(taskId, updatedData);
    } catch (err) {
      console.error('Update partial task error:', err);
      throw err;
    }
  };

  // Valore fornito dal Context
  const value = {
    tasks,                   // Array di tutte le tasks
    loading,                 // Boolean: true durante il caricamento
    error,                   // String: messaggio di errore (null se ok)
    fetchTasks,              // Funzione per ricaricare le tasks
    addTask,                 // Funzione per creare una task
    editTask,                // Funzione per aggiornare una task
    removeTask,              // Funzione per eliminare una task
    toggleTaskComplete,      // Funzione per toggle completed
    updateTaskPartial,       // Funzione per update parziale (es. solo description)
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

/**
 * Hook personalizzato per usare il TaskContext
 * 
 * @returns {Object} Oggetto con tasks e funzioni CRUD
 * 
 * Esempio d'uso:
 * const { tasks, addTask, editTask, removeTask } = useTasks();
 */
export const useTasks = () => {
  const context = useContext(TaskContext);
  
  if (!context) {
    throw new Error('useTasks deve essere usato all\'interno di un TaskProvider');
  }
  
  return context;
};

