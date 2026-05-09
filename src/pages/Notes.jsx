import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import NotesList from '../components/NotesList';
import NotesEditor from '../components/NotesEditor';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useNotes } from '../hooks/useNotes';
import { useGlobalSave } from '../context/GlobalSaveContext';
import { FileText } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, noteId: null, noteTitle: '' });
  const [mobileShowEditor, setMobileShowEditor] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');

  const {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    toggleFavorite,
    isLoading
  } = useNotes();

  const { registerSaveFunction, unregisterSaveFunction } = useGlobalSave();

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsInitialLoading(true);
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const results = await searchNotes(searchQuery);
          setNotes(results);
        } catch (err) {
          console.error('Search failed:', err);
        }
      } else {
        loadNotes();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Global Ctrl+N shortcut for new note
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  const handleSelectNote = (noteId) => {
    setSelectedNoteId(noteId);
    setSaveStatus(null);
    setMobileShowEditor(true);
  };

  // Sync currentTitle and currentContent when selected note changes to prevent saving empty strings if unchanged
  useEffect(() => {
    if (selectedNote) {
      setCurrentTitle(selectedNote.title || '');
      setCurrentContent(selectedNote.content || '');
    }
  }, [selectedNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote('Untitled Note');
      if (newNote) {
        setNotes(prev => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
        setSaveStatus(null);
        setMobileShowEditor(true);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const handleSave = useCallback(async (noteId, updates) => {
    try {
      setSaveStatus('saving');
      const updated = await updateNote(noteId, updates);
      if (updated) {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updated } : n));
        setSaveStatus('saved');
        // Reset to null after 3 seconds
        setTimeout(() => setSaveStatus(prev => prev === 'saved' ? null : prev), 3000);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [updateNote]);

  // Register global save function when note is selected
  useEffect(() => {
    if (selectedNote) {
      const saveFunction = () => {
        if (currentTitle !== (selectedNote?.title || '') || currentContent !== (selectedNote?.content || '')) {
          handleSave(selectedNote.id, { title: currentTitle, content: currentContent });
        }
      };
      registerSaveFunction(saveFunction);
      
      return () => {
        unregisterSaveFunction();
      };
    } else {
      unregisterSaveFunction();
    }
  }, [selectedNote?.id, currentTitle, currentContent, handleSave]);

  const handleToggleFavorite = async (noteId) => {
    try {
      const updatedNote = await toggleFavorite(noteId);
      if (updatedNote) {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updatedNote } : n));
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDeleteRequest = (noteId, noteTitle) => {
    setDeleteModal({ isOpen: true, noteId, noteTitle: noteTitle || 'Untitled Note' });
  };

  const handleDeleteConfirm = async () => {
    const { noteId } = deleteModal;
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
        setMobileShowEditor(false);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleMobileBack = () => {
    setMobileShowEditor(false);
  };

  return (
    <Layout 
      fullHeight 
      title="Notes" 
      icon={FileText} 
      actions={
        notes.length > 0 && (
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
            {notes.length}
          </span>
        )
      }
    >
      <div className="flex flex-col h-full min-h-0">


        {/* Split Layout */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Notes List — left sidebar */}
          <div className={`w-full lg:w-80 flex-shrink-0 ${mobileShowEditor ? 'hidden lg:flex' : 'flex'} flex-col border-r border-border`}>
            <NotesList
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteRequest}
              onToggleFavorite={handleToggleFavorite}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              isLoading={isInitialLoading}
            />
          </div>

          {/* Notes Editor — right pane */}
          <div className={`flex-1 min-w-0 ${mobileShowEditor ? 'flex' : 'hidden lg:flex'} flex-col`}>
            <NotesEditor
              note={selectedNote}
              onSave={handleSave}
              saveStatus={saveStatus}
              onTitleChange={setCurrentTitle}
              onContentChange={setCurrentContent}
              onBack={handleMobileBack}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Note"
        message={`Are you sure you want to delete "${deleteModal.noteTitle}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Layout>
  );
};

export default Notes;
