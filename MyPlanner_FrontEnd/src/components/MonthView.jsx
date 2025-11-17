/**
 * MonthView - Visualizzazione mensile stile calendario
 * 
 * Mostra un calendario mensile con le tasks riassuntive per ogni giorno
 * 
 * Props:
 * - tasks: array di tasks
 * - selectedDate: data selezionata per determinare il mese
 * - onEditTask: callback edit
 * - onDeleteTask: callback delete
 * - onToggleComplete: callback toggle
 * - onTaskSelect: callback per selezionare una task
 */

import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { it } from 'date-fns/locale';

const MonthView = ({
  tasks,
  selectedDate,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onDayClick,
  onTaskSelect,
}) => {
  /**
   * Calcola tutti i giorni da mostrare nel calendario
   * Include i giorni del mese precedente/successivo per riempire la griglia
   */
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  /**
   * Filtra le tasks per un giorno specifico
   */
  const getTasksForDay = (day) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.date_time);
      return isSameDay(taskDate, day);
    });
  };

  /**
   * Giorni della settimana (header)
   */
  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  return (
    <div className="h-full overflow-auto">
      {/* Header mese */}
      <div className="sticky top-0 bg-dash-card border-b border-dash-border p-5 z-10">
        <h3 className="text-lg font-semibold text-dash-primary">
          {format(selectedDate, 'MMMM yyyy', { locale: it })}
        </h3>
      </div>

      <div className="p-6">
        {/* Header giorni della settimana */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-dash-muted uppercase py-2 tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Griglia calendario */}
        <div className="grid grid-cols-7 gap-3">
          {daysInCalendar.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, selectedDate);
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
                  rounded-2xl border-2 p-3 min-h-[120px] transition-all
                  ${!isCurrentMonth ? 'bg-dash-bg text-dash-muted opacity-70 border-dash-border/50' : 'bg-white border-dash-border'}
                  ${today ? 'border-task-cyan/70 shadow-dash' : ''}
                  ${onDayClick ? 'cursor-pointer hover:shadow-dash hover:border-task-purple/60 focus:outline-none focus:ring-2 focus:ring-task-purple/40' : ''}
                `}
                aria-label={
                  onDayClick
                    ? `Aggiungi task il ${format(day, 'd MMMM yyyy', { locale: it })}`
                    : undefined
                }
              >
                {/* Numero giorno */}
                <div
                  className={`text-sm font-semibold mb-2 ${today ? 'text-task-cyan' : 'text-dash-primary'}`}
                >
                  {format(day, 'd')}
                </div>

                {/* Tasks riassuntive */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task, taskIdx) => {
                    const colorVariant = (idx + taskIdx) % 3;
                    const colorClass =
                      colorVariant === 0
                        ? 'bg-task-purple/10 text-task-purple'
                        : colorVariant === 1
                        ? 'bg-task-green/10 text-task-green'
                        : 'bg-task-orange/10 text-task-orange';

                    return (
                      <button
                        key={task.id}
                        className={`
                          w-full text-left text-xs px-2 py-1 rounded-lg truncate border
                          ${task.completed ? 'bg-dash-bg text-dash-muted border-dash-border' : colorClass}
                        `}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (onTaskSelect) {
                            onTaskSelect(task);
                          } else {
                            onEditTask(task);
                          }
                        }}
                        title={task.title}
                      >
                        {task.title}
                      </button>
                    );
                  })}
                  
                  {/* Mostra "+X altre" se ci sono più di 3 tasks */}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-dash-muted px-2">
                      +{dayTasks.length - 3} altre
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthView;

