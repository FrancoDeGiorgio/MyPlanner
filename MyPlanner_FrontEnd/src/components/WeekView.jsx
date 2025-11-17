/**
 * WeekView - Visualizzazione settimanale con colonne per giorni
 * 
 * Mostra la settimana corrente divisa in 7 colonne (Lun-Dom)
 * con le tasks raggruppate per giorno
 * 
 * Props:
 * - tasks: array di tasks
 * - selectedDate: data selezionata per determinare la settimana
 * - onEditTask: callback edit
 * - onDeleteTask: callback delete
 * - onToggleComplete: callback toggle
 * - onTaskSelect: callback per selezionare una task
 */

import React from 'react';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from 'date-fns';
import { it } from 'date-fns/locale';
import TaskCard from './TaskCard';

const WeekView = ({
  tasks,
  selectedDate,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onDayClick,
  onTaskSelect,
}) => {
  /**
   * Calcola i giorni della settimana (Lun-Dom)
   */
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // 1 = Lunedì
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  /**
   * Filtra le tasks per un giorno specifico
   */
  const getTasksForDay = (day) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.date_time);
      return isSameDay(taskDate, day);
    });
  };

  return (
    <div className="h-full overflow-auto">
      {/* Header settimana */}
      <div className="sticky top-0 bg-dash-card border-b border-dash-border p-5 z-10">
        <h3 className="text-lg font-semibold text-dash-primary">
          Settimana del {format(weekStart, 'd MMMM', { locale: it })} -{' '}
          {format(weekEnd, 'd MMMM yyyy', { locale: it })}
        </h3>
      </div>

      {/* Griglia 7 colonne */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 p-6">
        {daysInWeek.map((day, dayIndex) => {
          const dayTasks = getTasksForDay(day);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onDayClick?.(day);
                }
              }}
              role={onDayClick ? 'button' : undefined}
              tabIndex={onDayClick ? 0 : undefined}
              className={`
                rounded-2xl border-2 p-4 min-h-[220px] bg-white shadow-sm transition-shadow
                ${today ? 'border-task-orange/60 shadow-lg' : 'border-dash-border'}
                ${onDayClick ? 'cursor-pointer hover:shadow-dash focus:outline-none focus:ring-2 focus:ring-task-purple/40' : ''}
              `}
              aria-label={
                onDayClick
                  ? `Aggiungi task il ${format(day, 'EEEE d MMMM yyyy', { locale: it })}`
                  : undefined
              }
            >
              {/* Header giorno */}
              <div className="mb-3 pb-2 border-b border-dash-border/60">
                <p className={`text-xs font-semibold uppercase tracking-wide ${today ? 'text-task-orange' : 'text-dash-muted'}`}>
                  {format(day, 'EEE', { locale: it })}
                </p>
                <p className={`text-2xl font-semibold ${today ? 'text-task-orange' : 'text-dash-primary'}`}>
                  {format(day, 'd')}
                </p>
              </div>

              {/* Tasks del giorno */}
              <div className="space-y-2">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task, idx) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={dayIndex + idx}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onToggleComplete={onToggleComplete}
                      onSelect={onTaskSelect}
                      onFocus={onTaskSelect}
                    />
                  ))
                ) : (
                  <p className="text-xs text-dash-muted text-center mt-6">
                    Nessuna task
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;

