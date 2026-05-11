import React, { useState, useEffect, useRef } from 'react';
import { X, FolderPlus } from 'lucide-react';

const CreateFolderModal = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  initialName = '', 
  title, 
  placeholder,
  icon: Icon = FolderPlus 
}) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
    }
  };

  const displayTitle = title || (initialName ? 'Rename' : 'Create New Folder');
  const displayPlaceholder = placeholder || 'e.g. Documents';

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center">
            <Icon className="h-5 w-5 mr-2 text-primary" />
            {displayTitle}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-background rounded-md text-text_secondary hover:text-text_primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-text_secondary mb-1" htmlFor="itemName">
              Name
            </label>
            <input
              ref={inputRef}
              id="itemName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text_primary"
              placeholder={displayPlaceholder}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text_secondary hover:bg-background rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialName ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
