import React, { useState } from 'react';
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const FolderItem = ({ 
  folder, 
  onNavigate, 
  isSelected, 
  onSelect, 
  onContextMenu 
}) => {
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, folder, 'folder');
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(folder.id, 'folder', e.ctrlKey || e.metaKey);
  };

  return (
    <div 
      className={`relative flex flex-col items-center p-4 rounded-xl border transition-all cursor-pointer group select-none h-40 ${
        isSelected 
          ? 'bg-primary/10 border-primary shadow-sm' 
          : 'bg-surface border-border hover:border-primary/50 hover:shadow-md'
      }`}
      onDoubleClick={() => onNavigate(folder.id, folder.name)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <Folder 
        className={`h-12 w-12 mb-3 transition-colors ${isSelected ? 'text-primary' : 'text-primary/70 group-hover:text-primary'}`} 
        fill="currentColor" 
        fillOpacity={isSelected ? 0.3 : 0.1} 
      />
      
      <div className="text-center w-full">
        <p className={`text-sm font-medium truncate w-full px-1 ${isSelected ? 'text-primary' : 'text-text_primary'}`} title={folder.name}>
          {folder.name}
        </p>
        <p className="text-[10px] text-text_secondary mt-1">
          {new Date(folder.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default FolderItem;
