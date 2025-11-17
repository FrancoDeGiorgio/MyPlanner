/**
 * FocusView - Vista Focus con editor rich-text stile Notion
 * 
 * Permette di scrivere contenuto formattato per una task specifica.
 * Include editor TipTap con toolbar per formattazione (grassetto, corsivo, titoli, liste, link).
 * 
 * Props:
 * - selectedTask: task correntemente selezionata
 * - onUpdateTask: callback per aggiornare la task (salvataggio)
 */

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Link2, 
  Save,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const FocusView = ({ selectedTask, onUpdateTask }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Inizializza l'editor TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-task-purple underline hover:text-task-purple/80 cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Inizia a scrivere i tuoi appunti, idee, dettagli...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none max-w-none p-4 sm:p-6',
      },
    },
  });

  // Carica il contenuto quando cambia la task selezionata
  useEffect(() => {
    if (editor && selectedTask) {
      // Prova a parsare come JSON (TipTap), altrimenti usa come testo
      try {
        const content = JSON.parse(selectedTask.description);
        editor.commands.setContent(content);
      } catch {
        // Se non è JSON, usa come testo normale
        editor.commands.setContent(`<p>${selectedTask.description}</p>`);
      }
    }
  }, [selectedTask, editor]);

  /**
   * Salva il contenuto della task
   */
  const handleSave = async () => {
    if (!editor || !selectedTask) return;

    setIsSaving(true);
    try {
      // Ottieni il contenuto come JSON (formato TipTap)
      const content = editor.getJSON();
      
      // Aggiorna la task con il nuovo contenuto
      await onUpdateTask(selectedTask.id, {
        ...selectedTask,
        description: JSON.stringify(content),
      });

      setLastSaved(new Date());
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      alert('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Toggle link
   */
  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL del link:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Se non c'è editor, mostra loading
  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-dash-muted">Caricamento editor...</div>
      </div>
    );
  }

  // Se non c'è task selezionata
  if (!selectedTask) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <FileText size={64} className="mx-auto text-dash-muted/40" />
          <h3 className="text-xl font-semibold text-dash-primary">
            Nessuna task selezionata
          </h3>
          <p className="text-dash-muted">
            Seleziona una task dalla lista o dal calendario per visualizzare e modificare i suoi dettagli in modalità Focus.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header con info task */}
      <div className="bg-dash-card border-b border-dash-border px-4 sm:px-6 py-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-dash-primary truncate">
              {selectedTask.title}
            </h2>
            <p className="text-xs sm:text-sm text-dash-muted mt-1">
              {format(new Date(selectedTask.date_time), 'EEEE d MMMM yyyy, HH:mm', { locale: it })}
            </p>
          </div>
          
          {/* Pulsante Salva */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm
              ${
                isSaving
                  ? 'bg-dash-bg text-dash-muted cursor-not-allowed'
                  : 'bg-task-purple text-white hover:bg-task-purple/90 shadow-dash'
              }
            `}
          >
            <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">{isSaving ? 'Salvataggio...' : 'Salva'}</span>
            <span className="sm:hidden">{isSaving ? '...' : 'Salva'}</span>
          </button>
        </div>

        {/* Toolbar formattazione */}
        <div className="flex gap-1 bg-dash-bg rounded-xl p-2 overflow-x-auto">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`
              p-2 rounded-lg transition-colors
              ${
                editor.isActive('bold')
                  ? 'bg-dash-card text-task-purple shadow-sm'
                  : 'text-dash-muted hover:bg-dash-card hover:text-dash-primary'
              }
            `}
            title="Grassetto"
          >
            <Bold size={18} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`
              p-2 rounded-lg transition-colors
              ${
                editor.isActive('italic')
                  ? 'bg-dash-card text-task-purple shadow-sm'
                  : 'text-dash-muted hover:bg-dash-card hover:text-dash-primary'
              }
            `}
            title="Corsivo"
          >
            <Italic size={18} />
          </button>

          <div className="w-px h-8 bg-dash-border mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`
              p-2 rounded-lg transition-colors
              ${
                editor.isActive('heading', { level: 1 })
                  ? 'bg-dash-card text-task-purple shadow-sm'
                  : 'text-dash-muted hover:bg-dash-card hover:text-dash-primary'
              }
            `}
            title="Titolo 1"
          >
            <Heading1 size={18} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`
              p-2 rounded-lg transition-colors
              ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-dash-card text-task-purple shadow-sm'
                  : 'text-dash-muted hover:bg-dash-card hover:text-dash-primary'
              }
            `}
            title="Titolo 2"
          >
            <Heading2 size={18} />
          </button>

          <div className="w-px h-8 bg-dash-border mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`
              p-2 rounded-lg transition-colors
              ${
                editor.isActive('bulletList')
                  ? 'bg-dash-card text-task-purple shadow-sm'
                  : 'text-dash-muted hover:bg-dash-card hover:text-dash-primary'
              }
            `}
            title="Lista puntata"
          >
            <List size={18} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`
              p-2 rounded-lg transition-colors
              ${
                editor.isActive('orderedList')
                  ? 'bg-dash-card text-task-purple shadow-sm'
                  : 'text-dash-muted hover:bg-dash-card hover:text-dash-primary'
              }
            `}
            title="Lista numerata"
          >
            <ListOrdered size={18} />
          </button>

          <div className="w-px h-8 bg-dash-border mx-1" />

          <button
            onClick={setLink}
            className={`
              p-2 rounded-lg transition-colors
              ${
                editor.isActive('link')
                  ? 'bg-dash-card text-task-purple shadow-sm'
                  : 'text-dash-muted hover:bg-dash-card hover:text-dash-primary'
              }
            `}
            title="Aggiungi link"
          >
            <Link2 size={18} />
          </button>
        </div>

        {/* Indicatore ultimo salvataggio */}
        {lastSaved && (
          <p className="text-xs text-dash-muted">
            Ultimo salvataggio: {format(lastSaved, 'HH:mm:ss')}
          </p>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto bg-white">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};

export default FocusView;

