import React from 'react';
import { Search, Plus, Trash2, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * NotesList — Left sidebar panel showing all notes with search and create.
 */
const NotesList = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
  isLoading
}) => {

  // Strip markdown formatting for preview
  const getPreview = (content) => {
    if (!content) return 'Empty note';
    return content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[>\-*_~]/g, '')
      .trim()
      .slice(0, 100) || 'Empty note';
  };

  const formatDate = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Search + New Note */}
      <div className="p-4 space-y-3 flex-shrink-0 border-b border-border">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text_tertiary" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-text_primary text-sm placeholder:text-text_tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* New Note Button */}
        <button
          onClick={onCreateNote}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="h-10 w-10 text-text_tertiary mx-auto mb-3" />
            <p className="text-sm text-text_secondary font-medium">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </p>
            <p className="text-xs text-text_tertiary mt-1">
              {searchQuery ? 'Try a different search term' : 'Click "New Note" to get started'}
            </p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`group px-4 py-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedNoteId === note.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 ring-2 ring-primary/50 -translate-y-1'
                    : 'bg-surface2/50 hover:bg-surface2 border border-border/50 hover:border-primary/30 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className={`text-sm font-bold truncate ${
                        selectedNoteId === note.id
                          ? 'text-white'
                          : 'text-text_primary'
                      }`}>
                        {note.title || 'Untitled Note'}
                      </h3>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id, note.title);
                      }}
                      className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                        selectedNoteId === note.id
                          ? 'text-white/60 hover:text-white hover:bg-white/10'
                          : 'opacity-0 group-hover:opacity-100 text-text_tertiary hover:text-danger hover:bg-danger/10'
                      }`}
                      title="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Preview */}
                  <p className={`text-xs line-clamp-3 leading-relaxed mb-4 flex-1 ${
                    selectedNoteId === note.id
                      ? 'text-white/80'
                      : 'text-text_secondary'
                  }`}>
                    {getPreview(note.content)}
                  </p>

                  {/* Date */}
                  <div className="flex items-center mt-auto">
                    <p className={`text-[10px] uppercase tracking-widest font-bold ${
                      selectedNoteId === note.id
                        ? 'text-white/60'
                        : 'text-text_tertiary'
                    }`}>
                      {formatDate(note.updated_at || note.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer — note count */}
      {notes.length > 0 && (
        <div className="px-4 py-2 border-t border-border flex-shrink-0">
          <p className="text-[10px] text-text_tertiary uppercase tracking-wider font-medium text-center">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotesList;
