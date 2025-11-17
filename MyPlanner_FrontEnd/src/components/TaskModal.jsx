import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format, addMinutes } from 'date-fns';

/**
 * TaskModal - Modale per creare o modificare una task.
 *
 * Props attese:
 * - `isOpen`: booleano che controlla la visibilità del modale.
 * - `onClose`: funzione chiamata alla chiusura (reset esterno del flag isOpen).
 * - `onSave`: callback asincrona che riceve il payload pronto per le API.
 * - `task`: oggetto task da modificare; se `null` il modale è in modalità creazione.
 */

const colorOptions = [
  { value: 'green', label: 'Verde' },
  { value: 'purple', label: 'Viola' },
  { value: 'orange', label: 'Arancio' },
  { value: 'cyan', label: 'Ciano' },
  { value: 'pink', label: 'Rosa' },
  { value: 'yellow', label: 'Giallo' },
];

const EMPTY_RICH_TEXT = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

const TaskModal = ({ isOpen, onClose, onSave, task = null, initialDate = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(EMPTY_RICH_TEXT);
  const [color, setColor] = useState('green');
  const [dateTime, setDateTime] = useState('');
  const [useDuration, setUseDuration] = useState(false);
  const [endDateTime, setEndDateTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Popola o resetta i campi del form quando il modale si apre o la task cambia.
  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? EMPTY_RICH_TEXT);
      setColor(task.color);
      const startDate = new Date(task.date_time);
      setDateTime(format(startDate, "yyyy-MM-dd'T'HH:mm"));

      if (task.duration_minutes) {
        setUseDuration(true);
        setDurationMinutes(String(task.duration_minutes));
        setEndDateTime('');
      } else {
        setUseDuration(false);
        setDurationMinutes('');
        setEndDateTime(
          task.end_time ? format(new Date(task.end_time), "yyyy-MM-dd'T'HH:mm") : ''
        );
      }

      setCompleted(task.completed);
    } else {
      const baseDate = initialDate ? new Date(initialDate) : new Date();
      const safeBase = Number.isNaN(baseDate.getTime()) ? new Date() : baseDate;
      const defaultEnd = addMinutes(safeBase, 60);

      setTitle('');
      setDescription(EMPTY_RICH_TEXT);
      setColor('green');
      setDateTime(format(safeBase, "yyyy-MM-dd'T'HH:mm"));
      setUseDuration(false);
      setDurationMinutes('');
      setEndDateTime(format(defaultEnd, "yyyy-MM-dd'T'HH:mm"));
      setCompleted(false);
    }
  }, [task, isOpen, initialDate]);

  // Gestisce il submit del form: valida i dati, costruisce il payload e invoca onSave.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !dateTime) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    if (!useDuration && !endDateTime) {
      alert('Specifica una data/ora di fine oppure usa la durata.');
      return;
    }

    if (useDuration && !durationMinutes) {
      alert('Inserisci una durata in minuti.');
      return;
    }

    setLoading(true);

    try {
      const normalizedDescription =
        description && description.trim().length > 0 ? description.trim() : EMPTY_RICH_TEXT;

      const payload = {
        title: title.trim(),
        description: normalizedDescription,
        color,
        date_time: new Date(dateTime).toISOString(),
        end_time: !useDuration && endDateTime ? new Date(endDateTime).toISOString() : null,
        duration_minutes: useDuration && durationMinutes ? Number(durationMinutes) : null,
        completed,
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      alert('Errore nel salvataggio della task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay scuro che chiude il modale al click fuori */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header con titolo dinamico e pulsante di chiusura */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-planner-text">
            {task ? 'Modifica Task' : 'Nuova Task'}
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo titolo obbligatorio */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Titolo *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Es: Presentazione progetto"
              maxLength={150}
              required
            />
          </div>

          {/* Selettore di colore */}
          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Colore *
            </label>
            <select
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input-field"
            >
              {colorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Data e ora di inizio */}
          <div>
            <label
              htmlFor="dateTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data e Ora inizio *
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Durata o Data fine *
            </span>

            {/* Radio-buttons per scegliere tra end_time e durata */}
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="time-mode"
                  checked={!useDuration}
                  onChange={() => setUseDuration(false)}
                />
                Data/ora di fine
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="time-mode"
                  checked={useDuration}
                  onChange={() => setUseDuration(true)}
                />
                Durata (minuti)
              </label>
            </div>

            {!useDuration ? (
              <input
                type="datetime-local"
                id="endDateTime"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="input-field"
              />
            ) : (
              <input
                type="number"
                id="durationMinutes"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="input-field"
                min={5}
                max={1440}
                step={5}
                placeholder="Es: 60"
              />
            )}
          </div>

          {/* Checkbox stato completato */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-planner-accent focus:ring-planner-accent focus:ring-2"
            />
            <label
              htmlFor="completed"
              className="text-sm font-medium text-gray-700"
            >
              Task completata
            </label>
          </div>

          {/* Azioni: annulla/salva */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;