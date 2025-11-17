/**
 * ListView - Visualizzazione lista di tutte le tasks ordinate per data
 * 
 * Mostra tutte le tasks dell'utente in un elenco scrollabile,
 * raggruppate per data e ordinate dalle più vicine.
 * 
 * Props:
 * - tasks: array di tasks
 * - onEditTask: callback edit
 * - onDeleteTask: callback delete
 * - onToggleComplete: callback toggle
 * - onTaskSelect: callback per selezionare una task (usato per Focus view)
 * - selectedTaskId: ID della task correntemente selezionata
 */

import React, { useMemo } from 'react';
import { format, isSameDay, isToday, isPast, isFuture, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import TaskCard from './TaskCard';

const ListView = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onTaskSelect,
  selectedTaskId,
}) => {
  /**
   * Raggruppa le tasks per data e ordina per data crescente
   */
  const groupedTasks = useMemo(() => {
    // Ordina le tasks per data
    const sorted = [...tasks].sort((a, b) => {
      const dateA = new Date(a.date_time);
      const dateB = new Date(b.date_time);
      return dateA - dateB;
    });

    // Raggruppa per giorno
    const groups = {};
    sorted.forEach((task) => {
      const taskDate = new Date(task.date_time);
      const dayKey = format(taskDate, 'yyyy-MM-dd');
      
      if (!groups[dayKey]) {
        groups[dayKey] = {
          date: taskDate,
          tasks: [],
        };
      }
      
      groups[dayKey].tasks.push(task);
    });

    // Converte in array ordinato
    return Object.values(groups);
  }, [tasks]);

  /**
   * Determina la label per ogni gruppo di date
   */
  const getDateLabel = (date) => {
    const today = new Date();
    
    if (isToday(date)) {
      return 'Oggi';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (isSameDay(date, tomorrow)) {
      return 'Domani';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, yesterday)) {
      return 'Ieri';
    }
    
    return format(date, 'EEEE d MMMM yyyy', { locale: it });
  };

  /**
   * Determina la categoria temporale della data (passato/oggi/futuro)
   */
  const getDateCategory = (date) => {
    const today = startOfDay(new Date());
    const taskDay = startOfDay(date);
    
    if (isSameDay(taskDay, today)) {
      return 'today';
    }
    
    if (isPast(taskDay)) {
      return 'past';
    }
    
    return 'future';
  };

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-dash-card border-b border-dash-border p-4 sm:p-5 z-10">
        <h3 className="text-base sm:text-lg font-semibold text-dash-primary">
          Tutte le attività
        </h3>
        <p className="text-xs sm:text-sm text-dash-muted mt-1">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} totali
        </p>
      </div>

      {/* Lista raggruppata */}
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {groupedTasks.length > 0 ? (
          groupedTasks.map((group, groupIndex) => {
            const category = getDateCategory(group.date);
            
            return (
              <div key={groupIndex} className="space-y-3">
                {/* Header del gruppo */}
                <div className="flex items-center gap-3">
                  <h4
                    className={`text-base font-semibold ${
                      category === 'today'
                        ? 'text-task-cyan'
                        : category === 'past'
                        ? 'text-dash-muted'
                        : 'text-dash-primary'
                    }`}
                  >
                    {getDateLabel(group.date)}
                  </h4>
                  <div className="flex-1 h-px bg-dash-border" />
                  <span className="text-xs text-dash-muted">
                    {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tasks del gruppo */}
                <div className="space-y-2">
                  {group.tasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      className={`
                        transition-all
                        ${
                          selectedTaskId === task.id
                            ? 'ring-2 ring-task-purple/60 rounded-2xl'
                            : ''
                        }
                      `}
                      onClick={() => onTaskSelect?.(task)}
                    >
                      <TaskCard
                        task={task}
                        index={groupIndex + taskIndex}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onToggleComplete={onToggleComplete}
                        onFocus={onTaskSelect}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <p className="text-dash-muted text-lg">Nessuna task disponibile</p>
            <p className="text-sm text-dash-muted/70 mt-2">
              Clicca sul pulsante "+" per creare la tua prima task
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;

