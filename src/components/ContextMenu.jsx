import React, { useEffect, useRef } from 'react';
import { 
  Copy, 
  Move, 
  Edit2, 
  Trash2, 
  Info, 
  Download, 
  Clipboard, 
  Upload, 
  RefreshCw, 
  Plus, 
  FolderPlus, 
  FilePlus,
  ChevronRight
} from 'lucide-react';

const ContextMenu = ({ 
  x, 
  y, 
  type, 
  item, 
  onClose, 
  onAction,
  clipboardAction
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if menu goes off screen
  const style = {
    top: `${y}px`,
    left: `${x}px`,
  };

  const MenuItem = ({ icon: Icon, label, onClick, danger, disabled, subItems }) => (
    <div className="relative group/item">
      <button
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
          danger ? 'text-danger hover:bg-danger/10' : 'text-text_primary hover:bg-surface'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={(e) => {
          if (subItems) {
            e.stopPropagation();
          } else {
            onClick();
            onClose();
          }
        }}
      >
        <div className="flex items-center">
          {Icon && <Icon className={`h-4 w-4 mr-2 ${danger ? '' : 'text-text_secondary'}`} />}
          <span>{label}</span>
        </div>
        {subItems && <ChevronRight className="h-3.5 w-3.5 text-text_secondary" />}
      </button>

      {subItems && (
        <div className="absolute left-full top-0 ml-0.5 w-40 bg-background border border-border rounded-lg shadow-xl py-1 hidden group-hover/item:block">
          {subItems.map((sub, i) => (
            <button
              key={i}
              className="w-full flex items-center px-3 py-2 text-sm text-text_primary hover:bg-surface transition-colors"
              onClick={() => {
                sub.onClick();
                onClose();
              }}
            >
              {sub.icon && <sub.icon className="h-4 w-4 mr-2 text-text_secondary" />}
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div 
      ref={menuRef}
      className="fixed z-[1000] w-48 bg-background border border-border rounded-lg shadow-2xl py-1 animate-in fade-in zoom-in duration-100"
      style={style}
    >
      {type === 'file' && (
        <>
          <MenuItem icon={Copy} label="Copy" onClick={() => onAction('copy', item)} />
          <MenuItem icon={Move} label="Move" onClick={() => onAction('move', item)} />
          <MenuItem icon={Edit2} label="Rename" onClick={() => onAction('rename', item)} />
          <MenuItem icon={Download} label="Download" onClick={() => onAction('download', item)} />
          <div className="my-1 border-t border-border"></div>
          <MenuItem icon={Info} label="Details" onClick={() => onAction('details', item)} />
          <div className="my-1 border-t border-border"></div>
          <MenuItem icon={Trash2} label="Delete" onClick={() => onAction('delete', item)} danger />
        </>
      )}

      {type === 'folder' && (
        <>
          <MenuItem icon={Copy} label="Copy" onClick={() => onAction('copy', item)} />
          <MenuItem icon={Move} label="Move" onClick={() => onAction('move', item)} />
          <MenuItem icon={Edit2} label="Rename" onClick={() => onAction('rename', item)} />
          <div className="my-1 border-t border-border"></div>
          <MenuItem icon={Info} label="Details" onClick={() => onAction('details', item)} />
          <div className="my-1 border-t border-border"></div>
          <MenuItem icon={Trash2} label="Delete" onClick={() => onAction('delete', item)} danger />
        </>
      )}

      {type === 'empty' && (
        <>
          <MenuItem 
            icon={Clipboard} 
            label="Paste" 
            onClick={() => onAction('paste')} 
            disabled={!clipboardAction}
          />
          <div className="my-1 border-t border-border"></div>
          <MenuItem 
            icon={Plus} 
            label="New" 
            subItems={[
              { icon: FolderPlus, label: 'Folder', onClick: () => onAction('newFolder') },
              { icon: FilePlus, label: 'File', onClick: () => onAction('newFile') }
            ]}
          />
          <MenuItem icon={Upload} label="Upload" onClick={() => onAction('upload')} />
          <MenuItem icon={RefreshCw} label="Refresh" onClick={() => onAction('refresh')} />
          <div className="my-1 border-t border-border"></div>
          <MenuItem icon={Info} label="Details" onClick={() => onAction('dirDetails')} />
        </>
      )}
    </div>
  );
};

export default ContextMenu;
