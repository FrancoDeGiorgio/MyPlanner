import React from 'react';
import { format, addMinutes } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, Edit2, Trash2, FileText } from 'lucide-react';

/**
 * TaskCard - Scheda compatta per visualizzare una task con azioni rapide.
 *
 * Props richieste:
 * - `task`: oggetto task completo (inclusi title/description/color/date_time ecc.).
 * - `onEdit(task)`: callback invocata al click di modifica.
 * - `onDelete(taskId)`: callback invocata al click di eliminazione.
 * - `onToggleComplete(taskId)`: callback per cambiare lo stato `completed`.
 * - `onSelect(task)`: callback opzionale invocata al click sulla card (per selezione).
 */

const colorMap = {
  green: 'border-task-green bg-task-green/10 text-task-green',
  purple: 'border-task-purple bg-task-purple/10 text-task-purple',
  orange: 'border-task-orange bg-task-orange/10 text-task-orange',
  cyan: 'border-task-cyan bg-task-cyan/10 text-task-cyan',
  pink: 'border-task-pink bg-task-pink/10 text-task-pink',
  yellow: 'border-task-yellow bg-task-yellow/10 text-task-yellow',
};

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete, onSelect, onFocus }) => {
  // Restituisce una stringa formattata con intervallo orario o durata.
  const formatTaskInterval = (dateTimeString, endTimeString, durationMinutes) => {
    const start = new Date(dateTimeString);
    const startStr = format(start, 'HH:mm', { locale: it });

    if (endTimeString) {
      const end = new Date(endTimeString);
      const endStr = format(end, 'HH:mm', { locale: it });
      return `${startStr} → ${endStr}`;
    }

    if (durationMinutes) {
      const end = addMinutes(start, durationMinutes);
      const endStr = format(end, 'HH:mm', { locale: it });
      return `${startStr} → ${endStr} (${durationMinutes} min)`;
    }

    return startStr;
  };

  const colorClass = colorMap[task.color] ?? colorMap.green;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) {
          onSelect(task);
        }
      }}
      className={`
        border-2 ${colorClass} bg-white rounded-2xl p-4 cursor-pointer group relative overflow-hidden
        ${task.completed ? 'opacity-60' : ''}
      `}
    >
      {/* Colonna checkbox + testo */}
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className={`
            mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center
            transition-all duration-200
            ${
              task.completed
                ? 'bg-current border-current text-white'
                : 'border-current text-current hover:bg-current/10'
            }
          `}
        >
          {task.completed && <Check size={14} className="text-white" />}
        </button>

        {/* Testo principale (titolo + tempo) */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className={`text-sm font-semibold ${task.completed ? 'line-through text-dash-muted' : 'text-dash-primary'}`}>
            {task.title}
          </p>
          <p className="text-xs text-dash-muted">
            {formatTaskInterval(task.date_time, task.end_time, task.duration_minutes)}
          </p>
        </div>

        {/* Azioni laterali visibili al hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Modifica"
          >
            <Edit2 size={14} className="text-dash-muted" />
          </button>

          {onFocus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFocus(task);
              }}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Vai a Focus"
            >
              <FileText size={14} className="text-dash-muted" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Elimina"
          >
            <Trash2 size={14} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;