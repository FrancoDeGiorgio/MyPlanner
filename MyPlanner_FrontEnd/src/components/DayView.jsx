/**
 * DayView - Visualizzazione giornaliera con griglia oraria
 * 
 * Mostra le tasks di un giorno specifico disposte lungo una griglia oraria (0-23h)
 * 
 * Props:
 * - tasks: array di tasks da visualizzare
 * - selectedDate: data selezionata (Date object)
 * - onEditTask: callback per edit
 * - onDeleteTask: callback per delete
 * - onToggleComplete: callback per toggle completed
 * - onTaskSelect: callback per selezionare una task
 */

import React from 'react';
import { format, isSameDay, getHours } from 'date-fns';
import { it } from 'date-fns/locale';
import TaskCard from './TaskCard';

const DayView = ({
  tasks,
  selectedDate,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onDayClick,
  onTaskSelect,
}) => {
  /**
   * Filtra le tasks per il giorno selezionato
   */
  const tasksForDay = tasks.filter((task) => {
    const taskDate = new Date(task.date_time);
    return isSameDay(taskDate, selectedDate);
  });

  /**
   * Raggruppa le tasks per ora
   * Restituisce un oggetto: { 0: [tasks], 1: [tasks], ..., 23: [tasks] }
   */
  const groupTasksByHour = () => {
    const grouped = {};
    
    // Inizializza tutte le ore (0-23)
    for (let hour = 0; hour < 24; hour++) {
      grouped[hour] = [];
    }
    
    // Raggruppa le tasks
    tasksForDay.forEach((task) => {
      const taskDate = new Date(task.date_time);
      const hour = getHours(taskDate);
      grouped[hour].push(task);
    });
    
    return grouped;
  };

  const tasksByHour = groupTasksByHour();

  return (
    <div className="h-full overflow-auto">
      {/* Header con data */}
      <div className="sticky top-0 bg-dash-card border-b border-dash-border p-5 z-10">
        <h3 className="text-lg font-semibold text-dash-primary">
          {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
        </h3>
      </div>

      {/* Griglia oraria */}
      <div className="p-6 space-y-4">
        {Array.from({ length: 24 }, (_, hour) => {
          const hourDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            hour,
            0,
            0,
            0
          );

          return (
            <div
              key={hour}
              className="flex gap-3 min-h-[70px] border-b border-dash-border/60 pb-3"
            >
              {/* Colonna ora */}
              <div className="w-16 flex-shrink-0 text-sm font-semibold text-dash-muted pt-1">
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Colonna tasks */}
              <div
                className={`flex-1 space-y-3 ${
                  onDayClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-task-purple/40 rounded-lg' : ''
                }`}
                onClick={() => onDayClick?.(hourDate)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onDayClick?.(hourDate);
                  }
                }}
                role={onDayClick ? 'button' : undefined}
                tabIndex={onDayClick ? 0 : undefined}
                aria-label={
                  onDayClick
                    ? `Aggiungi task alle ${hour.toString().padStart(2, '0')}:00 del ${format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}`
                    : undefined
                }
              >
                {tasksByHour[hour].length > 0 ? (
                  tasksByHour[hour].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onToggleComplete={onToggleComplete}
                      onSelect={onTaskSelect}
                      onFocus={onTaskSelect}
                    />
                  ))
                ) : (
                  <div className="h-full flex items-center text-dash-border text-sm" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Messaggio se non ci sono tasks */}
      {tasksForDay.length === 0 && (
        <div className="text-center py-12 text-dash-muted">
          <p>Nessuna attività per oggi</p>
          <p className="text-sm mt-1">Clicca su "Nuova Task" per aggiungerne una</p>
        </div>
      )}
    </div>
  );
};

export default DayView;

