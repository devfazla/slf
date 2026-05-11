import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Home } from 'lucide-react';

const FolderTreeNode = ({ 
  folder, 
  allFolders, 
  currentFolderId, 
  onNavigate, 
  selectedItems,
  onContextMenu,
  depth = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Find children of this folder
  const children = allFolders.filter(f => f.parent_id === folder.id).sort((a, b) => a.name.localeCompare(b.name));
  const hasChildren = children.length > 0;
  const isCurrent = currentFolderId === folder.id;
  const isSelected = selectedItems?.some(si => si.id === folder.id && si.itemType === 'folder');

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onNavigate(folder.id, folder.name);
    // Auto-expand on select if it has children
    if (hasChildren && !isExpanded) setIsExpanded(true);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, folder, 'folder');
  };

  return (
    <div>
      <div 
        className={`flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
          isCurrent 
            ? 'bg-primary/10 text-primary' 
            : isSelected 
              ? 'bg-primary/5 text-primary border border-primary/20'
              : 'hover:bg-surface text-text_secondary hover:text-text_primary'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
      >
        <button 
          className="p-0.5 mr-1 rounded hover:bg-background/50 invisible group"
          onClick={handleToggle}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
        <Folder className={`h-4 w-4 mr-2 flex-shrink-0 ${isCurrent || isSelected ? 'fill-primary/20' : ''}`} />
        <span className="text-sm font-medium select-none whitespace-nowrap">{folder.name}</span>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="flex flex-col mt-0.5 ml-[18px] border-l border-border/60 relative">
          {children.map((child, index) => (
            <FolderTreeNode 
              key={child.id}
              folder={child}
              allFolders={allFolders}
              currentFolderId={currentFolderId}
              onNavigate={onNavigate}
              selectedItems={selectedItems}
              onContextMenu={onContextMenu}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = ({ allFolders, currentFolderId, onNavigate, selectedItems, onContextMenu }) => {
  // Get root folders (parent_id is null)
  const rootFolders = allFolders.filter(f => !f.parent_id).sort((a, b) => a.name.localeCompare(b.name));
  const isHomeSelected = currentFolderId === null;

  return (
    <div 
      className="min-w-full w-max whitespace-nowrap pr-4"
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, null, 'empty');
      }}
    >
      <div 
        className={`flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors mb-2 ${
          isHomeSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface text-text_secondary hover:text-text_primary'
        }`}
        onClick={() => onNavigate(null, 'Home')}
      >
        <div className="w-5 mr-1" /> {/* Spacer for alignment */}
        <Home className={`h-4 w-4 mr-2 ${isHomeSelected ? 'text-primary' : ''}`} />
        <span className="text-sm font-medium select-none">Home</span>
      </div>

      <div className="text-xs font-semibold text-text_secondary/50 uppercase tracking-wider mb-2 px-3 mt-4">
        Folders
      </div>

      <div className="flex flex-col gap-0.5">
        {rootFolders.map(folder => (
          <FolderTreeNode 
            key={folder.id}
            folder={folder}
            allFolders={allFolders}
            currentFolderId={currentFolderId}
            onNavigate={onNavigate}
            selectedItems={selectedItems}
            onContextMenu={onContextMenu}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};

export default FolderTree;
