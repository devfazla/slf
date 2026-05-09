import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Check, Loader2, Eye, Edit3, Columns, FileText } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';
import MarkdownToolbar from './MarkdownToolbar';
import UrlPromptDialog from './UrlPromptDialog';
/**
 * NotesEditor — Right pane with title input, markdown textarea, and live preview.
 * Supports three view modes: edit-only, split, preview-only.
 * Auto-saves after 30 seconds of inactivity.
 */

const AUTO_SAVE_DELAY = 30000; // 30 seconds

const NotesEditor = ({ note, onSave, saveStatus, onTitleChange, onContentChange }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'edit' | 'split' | 'preview'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [urlPrompt, setUrlPrompt] = useState({ isOpen: false, type: 'image' });
  const saveTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const isInitialLoad = useRef(true);
  const lastSavedTitle = useRef('');
  const lastSavedContent = useRef('');

  // Sync local state when the selected note changes
  useEffect(() => {
    if (note) {
      const newTitle = note.title || '';
      const newContent = note.content || '';
      setTitle(newTitle);
      setContent(newContent);
      lastSavedTitle.current = newTitle;
      lastSavedContent.current = newContent;
      setHasUnsavedChanges(false);
      isInitialLoad.current = true;
    }
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global auto-focus when typing
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (e.key.length === 1 && viewMode !== 'preview') {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [viewMode]);

  // Auto-save with debounce - only saves after 5 seconds of inactivity
  const triggerAutoSave = useCallback((newTitle, newContent) => {
    // Check if content actually changed compared to last saved values
    const titleChanged = newTitle !== lastSavedTitle.current;
    const contentChanged = newContent !== lastSavedContent.current;
    
    if (titleChanged || contentChanged) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
      return;
    }

    // Skip auto-save during initial load, but still track changes
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout - will only execute if no further activity occurs
    saveTimeoutRef.current = setTimeout(() => {
      if (note && (newTitle !== lastSavedTitle.current || newContent !== lastSavedContent.current)) {
        lastSavedTitle.current = newTitle;
        lastSavedContent.current = newContent;
        onSave(note.id, { title: newTitle, content: newContent });
      }
    }, AUTO_SAVE_DELAY);
  }, [note, onSave]);

  // Reset unsaved changes when save completes
  useEffect(() => {
    if (saveStatus === 'saved') {
      setHasUnsavedChanges(false);
    }
  }, [saveStatus]);

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
    onTitleChange?.(newTitle);
    triggerAutoSave(newTitle, content);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
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

  const applyFormatting = (before, after = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${before}${selectedText || defaultText}${after}`;

    // Use execCommand to preserve undo history. This will trigger onChange if supported.
    document.execCommand('insertText', false, replacement);
    
    // In some React setups, execCommand on controlled inputs might not fire onChange reliably.
    // If we notice state sync issues, we can manually dispatch an Event, but let's try this first.
    // Wait for state to possibly update, then set selection.
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + before.length + defaultText.length, start + before.length + defaultText.length);
      }
    }, 0);
  };

  const handleFormat = (action, value) => {
    switch (action) {
      case 'bold': applyFormatting('**', '**', 'bold text'); break;
      case 'italic': applyFormatting('*', '*', 'italic text'); break;
      case 'bold-italic': applyFormatting('***', '***', 'bold italic text'); break;
      case 'strikethrough': applyFormatting('~~', '~~', 'strikethrough text'); break;
      case 'underline': applyFormatting('<u>', '</u>', 'underline text'); break;
      case 'highlight': applyFormatting('==', '==', 'highlighted text'); break;
      case 'subscript': applyFormatting('~', '~', 'sub'); break;
      case 'superscript': applyFormatting('^', '^', 'sup'); break;
      case 'heading': applyFormatting(`\n${'#'.repeat(value)} `, '', 'Heading'); break;
      case 'ordered-list': applyFormatting('\n1. ', '', 'List item'); break;
      case 'unordered-list': applyFormatting('\n- ', '', 'List item'); break;
      case 'task-list': applyFormatting('\n- [ ] ', '', 'Task item'); break;
      case 'blockquote': applyFormatting('\n> ', '', 'Quote'); break;
      case 'code': applyFormatting('\n```\n', '\n```\n', 'code'); break;
      case 'inline-code': applyFormatting('`', '`', 'inline code'); break;
      case 'table': applyFormatting('\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Text     | Text     |\n', ''); break;
      case 'details': applyFormatting('\n<details>\n<summary>Click to expand</summary>\n\n', '\n\n</details>\n', 'Hidden content'); break;
      case 'mermaid': applyFormatting('\n```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n', ''); break;
      case 'hr': applyFormatting('\n---\n', ''); break;
      case 'kbd': applyFormatting('<kbd>', '</kbd>', 'Key'); break;
      case 'escape': applyFormatting('\\', '', ''); break;
      case 'image': setUrlPrompt({ isOpen: true, type: 'image' }); break;
      case 'link': setUrlPrompt({ isOpen: true, type: 'link' }); break;
      default: break;
    }
  };

  const handleAddUrl = (url, alt) => {
    if (urlPrompt.type === 'image') {
      applyFormatting(`![${alt || 'Image'}](${url})`, '', '');
    } else {
      applyFormatting(`[${alt || 'Link text'}](${url})`, '', '');
    }
  };

  // Handle keydown in textarea for shortcuts, lists, and tables
  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.ctrlKey) {
      if (e.key === 'b') { e.preventDefault(); handleFormat('bold'); return; }
      if (e.key === 'i') { e.preventDefault(); handleFormat('italic'); return; }
      if (e.key === 'u') { e.preventDefault(); handleFormat('underline'); return; }
      if (e.key === 'k') { e.preventDefault(); handleFormat('link'); return; }
      if (e.key === 'e') { e.preventDefault(); handleFormat('inline-code'); return; }
      if (e.shiftKey) {
        if (e.key.toLowerCase() === 'x') { e.preventDefault(); handleFormat('strikethrough'); return; }
        if (e.key.toLowerCase() === 'k') { e.preventDefault(); handleFormat('image'); return; }
        if (e.key.toLowerCase() === 'c') { e.preventDefault(); handleFormat('code'); return; }
      }
    }

    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    
    // Auto-continue lists and table rows on Enter
    if (e.key === 'Enter') {
      const textBeforeCursor = content.substring(0, start);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      // Match list markers: - [ ] , - [x] , - , * , 1. 
      const listMatch = currentLine.match(/^(\s*)(-\s\[[ x]\]\s|-\s|\*\s|\d+\.\s)(.*)$/);
      
      if (listMatch) {
        e.preventDefault();
        const [, indent, marker, text] = listMatch; // eslint-disable-line no-unused-vars
        if (!text.trim()) {
          // Double enter on empty list item: exit list
          const newContent = content.substring(0, start - marker.length - indent.length) + content.substring(end);
          setContent(newContent);
          triggerAutoSave(title, newContent);
          requestAnimationFrame(() => {
            e.target.selectionStart = e.target.selectionEnd = start - marker.length - indent.length;
          });
        } else {
          // Continue list
          let nextMarker = marker;
          const numberMatch = marker.match(/^(\d+)\.\s$/);
          if (numberMatch) {
            nextMarker = `${parseInt(numberMatch[1], 10) + 1}. `;
          }
          if (marker.includes('[x]')) {
            nextMarker = nextMarker.replace('[x]', '[ ]');
          }
          applyFormatting(`\n${indent}${nextMarker}`, '');
        }
        return;
      }

      // Basic Table automation // TODO: Fully automate table column alignment later
      const tableMatch = currentLine.match(/^(\s*\|.*\|)\s*$/);
      if (tableMatch) {
        const pipeCount = (currentLine.match(/\|/g) || []).length;
        if (pipeCount > 1) {
          e.preventDefault();
          const nextRow = '\n' + '|   '.repeat(pipeCount - 1) + '|';
          applyFormatting(nextRow, '');
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 3;
            }
          }, 0);
          return;
        }
      }
    }

    // Table Tab navigation
    if (e.key === 'Tab' && !e.shiftKey) {
      const textBeforeCursor = content.substring(0, start);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine.includes('|')) {
        e.preventDefault();
        const textAfterCursor = content.substring(end);
        const nextPipeIdx = textAfterCursor.indexOf('|');
        if (nextPipeIdx !== -1) {
          const nextPos = end + nextPipeIdx + 1;
          e.target.selectionStart = e.target.selectionEnd = nextPos + 1;
        }
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      applyFormatting('  ', '');
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
        // Only show "Unsaved" if there are actual unsaved changes
        if (hasUnsavedChanges) {
          return (
            <div className="flex items-center space-x-1.5 text-text_tertiary">
              <div className="h-1.5 w-1.5 rounded-full bg-warning" />
              <span className="text-xs font-medium">Unsaved</span>
            </div>
          );
        }
        // Don't show anything if no changes
        return null;
    }
  };

  const handleToggleTask = (lineIndex) => {
    const lines = content.split('\n');
    const line = lines[lineIndex];
    if (line.includes('[ ]')) {
      lines[lineIndex] = line.replace('[ ]', '[x]');
    } else if (line.includes('[x]')) {
      lines[lineIndex] = line.replace('[x]', '[ ]');
    } else if (line.includes('[X]')) {
      lines[lineIndex] = line.replace('[X]', '[ ]');
    }
    const newContent = lines.join('\n');
    setContent(newContent);
    onContentChange?.(newContent);
    triggerAutoSave(title, newContent);
  };

  // Save on outer click
  const handleBlur = (e) => {
    // If the new focus target is outside the NotesEditor component, save immediately
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (hasUnsavedChanges) {
        handleManualSave();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0" onBlur={handleBlur}>
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

      {/* Toolbar */}
      {viewMode !== 'preview' && (
        <MarkdownToolbar onFormat={handleFormat} />
      )}

      {/* Editor / Preview Panes */}
      <div className="flex-1 flex min-h-0 overflow-hidden border-t border-border">
        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex flex-col min-h-0 ${viewMode === 'split' ? 'w-1/2 border-r border-border' : 'w-full'}`}>
            <textarea
              ref={textareaRef}
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
              <MarkdownPreview content={content} onToggleTask={handleToggleTask} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UrlPromptDialog 
        isOpen={urlPrompt.isOpen}
        type={urlPrompt.type}
        onClose={() => setUrlPrompt({ ...urlPrompt, isOpen: false })}
        onAdd={handleAddUrl}
      />
    </div>
  );
};

export default NotesEditor;
