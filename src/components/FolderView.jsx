import React from 'react';
import FolderItem from './FolderItem';
import FileItem from './FileItem';
import { Loader2 } from 'lucide-react';

const FolderView = ({ 
  items, 
  isLoading, 
  onNavigate, 
  selectedItems,
  onSelect,
  onContextMenu,
  onDownloadFile
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, null, 'empty');
  };

  if (items.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-64 bg-surface/50 rounded-xl border border-dashed border-border p-8 text-center"
        onContextMenu={handleContextMenu}
      >
        <p className="text-text_secondary mb-2 pointer-events-none">This folder is empty</p>
        <p className="text-sm text-text_secondary/70 pointer-events-none">Drag and drop files here or create a new folder</p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 min-h-[300px]"
      onContextMenu={handleContextMenu}
    >
      {items.map((item) => {
        const isSelected = selectedItems.some(si => si.id === item.id && si.itemType === item.itemType);
        
        if (item.itemType === 'folder') {
          return (
            <FolderItem 
              key={`folder-${item.id}`} 
              folder={item} 
              onNavigate={onNavigate}
              isSelected={isSelected}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          );
        } else {
          return (
            <FileItem 
              key={`file-${item.id}`} 
              file={item} 
              onDownload={onDownloadFile}
              isSelected={isSelected}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          );
        }
      })}
    </div>
  );
};

export default FolderView;
