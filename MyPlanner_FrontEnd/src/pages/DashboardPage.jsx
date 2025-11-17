/**
 * DashboardPage - Pagina principale dell'applicazione
 * 
 * Features:
 * - Header con username e logout
 * - Toggle tra visualizzazioni: Giorno / Settimana / Mese
 * - Navigazione tra date
 * - Pulsante "Nuova Task" floating
 * - Modal per create/edit task
 * - Conferma delete
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../contexts/TaskContext';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, addWeeks, addMonths, format } from 'date-fns';
import { it } from 'date-fns/locale';

import ListView from '../components/ListView';
import CalendarView from '../components/CalendarView';
import FocusView from '../components/FocusView';
import TaskModal from '../components/TaskModal';
import DashboardLayout from '../components/DashboardLayout';
import { useSettings } from '../contexts/SettingsContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { accentColor, accentForeground } = useSettings();
  const { tasks, addTask, editTask, removeTask, toggleTaskComplete } = useTasks();

  // Stato: visualizzazione corrente ('list' | 'calendar' | 'focus')
  const [viewMode, setViewMode] = useState('list');
  
  // Stato: data selezionata (usata solo in modalità calendario)
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Stato: task selezionata (usata in modalità focus)
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Stato: modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState(null);


  useEffect(() => {
    document.body.classList.remove('login-active');
  }, []);

  /**
   * Naviga alla data precedente (solo in modalità calendario)
   */
  const handlePrevious = () => {
    if (viewMode === 'calendar') {
      setSelectedDate((prev) => addMonths(prev, -1));
    }
  };

  /**
   * Naviga alla data successiva (solo in modalità calendario)
   */
  const handleNext = () => {
    if (viewMode === 'calendar') {
      setSelectedDate((prev) => addMonths(prev, 1));
    }
  };

  /**
   * Torna a oggi (solo in modalità calendario)
   */
  const handleToday = () => {
    if (viewMode === 'calendar') {
      setSelectedDate(new Date());
    }
  };

  /**
   * Seleziona una task (usato per la modalità Focus)
   */
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    // Opzionalmente, passa alla modalità Focus
    if (viewMode !== 'focus') {
      setViewMode('focus');
    }
  };

  /**
   * Apre il modal per creare una nuova task
   */
  const handleNewTask = (date = null) => {
    setTaskToEdit(null);

    if (date) {
      const selected = new Date(date);
      if (!Number.isNaN(selected.getTime())) {
        const hasCustomTime =
          selected.getHours() !== 0 ||
          selected.getMinutes() !== 0 ||
          selected.getSeconds() !== 0 ||
          selected.getMilliseconds() !== 0;
        const preset = hasCustomTime
          ? selected
          : new Date(
              selected.getFullYear(),
              selected.getMonth(),
              selected.getDate(),
              9,
              0,
              0,
              0
            );
        setDefaultTaskDate(preset);
      } else {
        setDefaultTaskDate(null);
      }
    } else {
      setDefaultTaskDate(null);
    }

    setIsModalOpen(true);
  };

  /**
   * Apre il modal per modificare una task
   */
  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setDefaultTaskDate(null);
    setIsModalOpen(true);
  };

  /**
   * Elimina una task (con conferma)
   */
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa task?')) {
      try {
        await removeTask(taskId);
      } catch (error) {
        alert('Errore durante l\'eliminazione della task');
      }
    }
  };

  /**
   * Salva la task (create o update)
   */
  const handleSaveTask = async (taskData) => {
    if (taskToEdit) {
      // Update
      await editTask(taskToEdit.id, taskData);
    } else {
      // Create
      await addTask(taskData);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
    setDefaultTaskDate(null);
  };

  /**
   * Formatta l'intestazione data (solo per modalità calendario)
   */
  const getDateHeader = () => {
    if (viewMode === 'calendar') {
      return format(selectedDate, 'MMMM yyyy', { locale: it });
    }
    return '';
  };

  const handleNavigation = (section) => {
    if (section === 'settings') {
      navigate('/settings');
    }
  };

  const isAccentDark = accentForeground === '#FFFFFF';
  const bubbleStyle = {
    backgroundColor: isAccentDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
    color: accentForeground,
  };
  const dividerStyle = {
    backgroundColor: isAccentDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)',
  };
  const hoverStyle = isAccentDark ? 'hover:bg-white/20' : 'hover:bg-white';

  const headerActions =
    viewMode === 'calendar' ? (
      <div className="flex items-center gap-3 rounded-full px-4 py-2" style={bubbleStyle}>
        <button
          onClick={handleToday}
          className="text-sm font-medium"
          style={{ color: accentForeground }}
        >
          Oggi
        </button>
        <div className="w-px h-6" style={dividerStyle} />
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className={`p-1.5 rounded-full transition-colors ${hoverStyle}`}
            style={{ color: accentForeground }}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {getDateHeader()}
          </span>
          <button
            onClick={handleNext}
            className={`p-1.5 rounded-full transition-colors ${hoverStyle}`}
            style={{ color: accentForeground }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    ) : null;

  const floatingAction = (
    <button
      onClick={handleNewTask}
      className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-dash flex items-center justify-center hover:scale-105 transition-transform z-30"
      title="Nuova Task"
      style={{
        backgroundColor: accentColor,
        color: accentForeground,
      }}
    >
      <Plus size={26} />
    </button>
  );

  return (
    <DashboardLayout
      activeNav="dashboard"
      onNavigate={handleNavigation}
      title="Dashboard"
      subtitle="Visualizza e gestisci le tue attività"
      headerActions={headerActions}
      floatingAction={floatingAction}
    >
      {/* Toggle view - Tre modalità principali */}
      <div className="pt-4 sm:pt-6 flex justify-between items-center gap-2 sm:gap-4">
        <h2 className="text-base sm:text-lg font-semibold">Panoramica</h2>
        <div className="flex gap-1 sm:gap-2 bg-dash-bg rounded-full p-1">
          {['list', 'calendar', 'focus'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`
                px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all
                ${
                  viewMode === mode
                    ? 'bg-dash-card shadow-dash text-dash-primary'
                    : 'text-dash-muted hover:text-dash-primary'
                }
              `}
            >
              {mode === 'list' ? 'Lista' : mode === 'calendar' ? 'Calendario' : 'Focus'}
            </button>
          ))}
        </div>
      </div>

      {/* Contenuto principale - Renderizza la vista corrente */}
      <div className="flex-1 overflow-hidden pb-10">
        <div className="mt-6 bg-dash-card shadow-dash rounded-2xl h-full overflow-hidden">
          {viewMode === 'list' && (
            <ListView
              tasks={tasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={toggleTaskComplete}
              onTaskSelect={handleTaskSelect}
              selectedTaskId={selectedTask?.id}
            />
          )}

          {viewMode === 'calendar' && (
            <CalendarView
              tasks={tasks}
              selectedDate={selectedDate}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={toggleTaskComplete}
              onDayClick={handleNewTask}
              onTaskSelect={handleTaskSelect}
            />
          )}

          {viewMode === 'focus' && (
            <FocusView
              selectedTask={selectedTask}
              onUpdateTask={editTask}
            />
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={taskToEdit}
        initialDate={defaultTaskDate}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;

