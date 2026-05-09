import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const FolderNav = ({ currentPath, navigateToPathIndex }) => {
  return (
    <div className="flex items-center text-sm text-text_secondary mb-6 bg-surface p-3 rounded-lg border border-border shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
      {currentPath.map((folder, index) => {
        const isLast = index === currentPath.length - 1;
        
        return (
          <React.Fragment key={folder.id || 'root'}>
            <button
              onClick={() => !isLast && navigateToPathIndex(index)}
              className={`flex items-center transition-colors ${
                isLast 
                  ? 'text-primary font-medium cursor-default' 
                  : 'hover:text-primary cursor-pointer'
              }`}
            >
              {index === 0 && <Home className="h-4 w-4 mr-1.5" />}
              {folder.name}
            </button>
            
            {!isLast && (
              <ChevronRight className="h-4 w-4 mx-2 text-border flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default FolderNav;
