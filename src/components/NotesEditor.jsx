import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Check, Loader2, Eye, Edit3, Columns, FileText } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';

/**
 * NotesEditor — Right pane with title input, markdown textarea, and live preview.
 * Supports three view modes: edit-only, split, preview-only.
 * Auto-saves after 3 seconds of inactivity.
 */

const AUTO_SAVE_DELAY = 3000; // 3 seconds

const NotesEditor = ({ note, onSave, saveStatus }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'edit' | 'split' | 'preview'
  const saveTimeoutRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Sync local state when the selected note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      isInitialLoad.current = true;
    }
  }, [note?.id]);

  // Auto-save with debounce
  const triggerAutoSave = useCallback((newTitle, newContent) => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (note) {
        onSave(note.id, { title: newTitle, content: newContent });
      }
    }, AUTO_SAVE_DELAY);
  }, [note, onSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    triggerAutoSave(newTitle, content);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    triggerAutoSave(title, newContent);
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (note) {
      onSave(note.id, { title, content });
    }
  };

  // Handle tab key in textarea for indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      triggerAutoSave(title, newContent);
      // Restore cursor position after React re-renders
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      });
    }

    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleManualSave();
    }
  };

  // Empty state
  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="h-16 w-16 text-text_tertiary mx-auto mb-4 opacity-40" />
          <p className="text-lg text-text_secondary font-medium">No note selected</p>
          <p className="text-sm text-text_tertiary mt-1">Select a note or create a new one</p>
        </div>
      </div>
    );
  }

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center space-x-1.5 text-text_tertiary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs font-medium">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center space-x-1.5 text-success">
            <Check className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-1.5 text-danger">
            <span className="text-xs font-medium">Save failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1.5 text-text_tertiary">
            <div className="h-1.5 w-1.5 rounded-full bg-warning" />
            <span className="text-xs font-medium">Unsaved</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center space-x-3">
          {/* Save status */}
          {renderSaveStatus()}
        </div>

        <div className="flex items-center space-x-1">
          {/* View mode toggles */}
          <button
            onClick={() => setViewMode('edit')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'edit'
                ? 'bg-primary/10 text-primary'
                : 'text-text_tertiary hover:text-text_primary hover:bg-surface2'
            }`}
            title="Edit only"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'split'
                ? 'bg-primary/10 text-primary'
                : 'text-text_tertiary hover:text-text_primary hover:bg-surface2'
            }`}
            title="Split view"
          >
            <Columns className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'preview'
                ? 'bg-primary/10 text-primary'
                : 'text-text_tertiary hover:text-text_primary hover:bg-surface2'
            }`}
            title="Preview only"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Manual save button */}
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={handleManualSave}
            className="p-2 rounded-md text-text_tertiary hover:text-primary hover:bg-surface2 transition-colors"
            title="Save (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-6 pt-5 pb-2 flex-shrink-0">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full text-2xl font-bold text-text_primary bg-transparent border-none outline-none placeholder:text-text_tertiary/50"
        />
      </div>

      {/* Editor / Preview Panes */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex flex-col min-h-0 ${viewMode === 'split' ? 'w-1/2 border-r border-border' : 'w-full'}`}>
            <textarea
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Start writing in markdown..."
              className="flex-1 w-full px-6 py-3 bg-transparent text-text_primary text-sm leading-relaxed resize-none outline-none placeholder:text-text_tertiary/40 font-mono"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`flex flex-col min-h-0 overflow-y-auto ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <div className="px-6 py-3">
              {viewMode === 'split' && (
                <p className="text-[10px] uppercase tracking-wider text-text_tertiary font-semibold mb-3">Preview</p>
              )}
              <MarkdownPreview content={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesEditor;
