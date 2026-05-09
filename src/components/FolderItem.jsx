import React, { useState } from 'react';
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const FolderItem = ({ folder, onNavigate, onRename, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onRename(folder);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(folder);
  };

  return (
    <div 
      className="relative flex flex-col items-center p-4 bg-surface rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
      onDoubleClick={() => onNavigate(folder.id, folder.name)}
      onClick={() => onNavigate(folder.id, folder.name)}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          className="p-1 hover:bg-background rounded-md text-text_secondary hover:text-text_primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-border rounded-lg shadow-xl py-1 z-10">
            <button 
              className="w-full flex items-center px-3 py-1.5 text-sm hover:bg-background transition-colors"
              onClick={handleRename}
            >
              <Edit2 className="h-3.5 w-3.5 mr-2 text-text_secondary" />
              Rename
            </button>
            <button 
              className="w-full flex items-center px-3 py-1.5 text-sm hover:bg-background text-danger transition-colors"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      <Folder className="h-12 w-12 text-primary mb-3" fill="currentColor" fillOpacity={0.2} />
      
      <div className="text-center w-full">
        <p className="text-sm font-medium text-text_primary truncate w-full px-1" title={folder.name}>
          {folder.name}
        </p>
        <p className="text-xs text-text_secondary mt-1">
          {new Date(folder.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Invisible overlay to close menu when clicking outside could be added here, but omitted for simplicity */}
    </div>
  );
};

export default FolderItem;
