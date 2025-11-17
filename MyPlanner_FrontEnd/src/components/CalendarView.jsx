/**
 * CalendarView - Wrapper per le visualizzazioni calendario con sotto-modalità
 * 
 * Gestisce tre sotto-modalità:
 * - Giorno: vista giornaliera con griglia oraria
 * - Settimana: vista settimanale con colonne per giorni
 * - Mese: vista mensile stile calendario
 * 
 * Props:
 * - tasks: array di tasks
 * - selectedDate: data selezionata per determinare periodo
 * - onEditTask: callback edit
 * - onDeleteTask: callback delete
 * - onToggleComplete: callback toggle
 * - onDayClick: callback per click su giorno (per creare task)
 * - onTaskSelect: callback per selezionare una task (usato per Focus view)
 */

import React, { useState } from 'react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';

const CalendarView = ({
  tasks,
  selectedDate,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onDayClick,
  onTaskSelect,
}) => {
  // Stato locale per la sotto-modalità calendario
  const [calendarMode, setCalendarMode] = useState('month');

  return (
    <div className="h-full flex flex-col">
      {/* Sotto-header con i tre pulsanti per cambiare modalità calendario */}
      <div className="bg-dash-card border-b border-dash-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex gap-1 sm:gap-2 bg-dash-bg rounded-full p-1 w-fit">
          {['day', 'week', 'month'].map((mode) => (
            <button
              key={mode}
              onClick={() => setCalendarMode(mode)}
              className={`
                px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all
                ${
                  calendarMode === mode
                    ? 'bg-dash-card shadow-dash text-dash-primary'
                    : 'text-dash-muted hover:text-dash-primary'
                }
              `}
            >
              {mode === 'day' ? 'Giorno' : mode === 'week' ? 'Settimana' : 'Mese'}
            </button>
          ))}
        </div>
      </div>

      {/* Contenuto - Renderizza la vista appropriata */}
      <div className="flex-1 overflow-hidden">
        {calendarMode === 'day' && (
          <DayView
            tasks={tasks}
            selectedDate={selectedDate}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onToggleComplete={onToggleComplete}
            onDayClick={onDayClick}
            onTaskSelect={onTaskSelect}
          />
        )}

        {calendarMode === 'week' && (
          <WeekView
            tasks={tasks}
            selectedDate={selectedDate}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onToggleComplete={onToggleComplete}
            onDayClick={onDayClick}
            onTaskSelect={onTaskSelect}
          />
        )}

        {calendarMode === 'month' && (
          <MonthView
            tasks={tasks}
            selectedDate={selectedDate}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onToggleComplete={onToggleComplete}
            onDayClick={onDayClick}
            onTaskSelect={onTaskSelect}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarView;

