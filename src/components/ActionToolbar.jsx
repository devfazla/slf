import { 
  FolderPlus, 
  FilePlus, 
  Upload, 
  RefreshCw, 
  Copy, 
  Clipboard, 
  Move, 
  Edit2, 
  Download 
} from 'lucide-react';

const ActionToolbar = ({ 
  onRefresh, 
  onNewFolder, 
  onNewFile,
  onUpload,
  onCopy,
  onPaste,
  onMove,
  onRename,
  onDownload,
  selectedItems,
  clipboardAction,
  isLoading 
}) => {
  const hasSelection = selectedItems.length > 0;
  const singleSelection = selectedItems.length === 1;
  const hasFileSelected = selectedItems.some(item => item.itemType === 'file');

  const IconButton = ({ icon: Icon, label, onClick, disabled, primary, variant = 'default' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all shadow-sm ${
        disabled 
          ? 'opacity-40 cursor-not-allowed bg-surface border-border text-text_secondary' 
          : primary
            ? 'bg-primary text-white hover:bg-primary/90'
            : variant === 'blue'
              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20'
              : 'bg-surface border border-border text-text_primary hover:bg-background'
      }`}
    >
      <Icon className={`h-4 w-4 ${!primary && !disabled && variant === 'default' ? 'text-text_secondary' : ''} ${primary || variant !== 'default' ? 'mr-1.5' : ''}`} />
      {(primary || variant !== 'default') && label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border">
      <IconButton icon={FolderPlus} label="New Folder" onClick={onNewFolder} primary />
      <IconButton icon={FilePlus} label="New File" onClick={onNewFile} variant="blue" />
      
      <div className="h-6 w-px bg-border mx-1"></div>

      <IconButton 
        icon={Upload} 
        label="Upload" 
        onClick={onUpload} 
      />

      <div className="h-6 w-px bg-border mx-1"></div>

      <IconButton 
        icon={Copy} 
        label="Copy" 
        onClick={onCopy} 
        disabled={!hasSelection}
      />
      <IconButton 
        icon={Move} 
        label="Move" 
        onClick={onMove} 
        disabled={!hasSelection}
      />
      <IconButton 
        icon={Clipboard} 
        label="Paste" 
        onClick={onPaste} 
        disabled={!clipboardAction}
      />

      <div className="h-6 w-px bg-border mx-1"></div>

      <IconButton 
        icon={Edit2} 
        label="Rename" 
        onClick={onRename} 
        disabled={!singleSelection}
      />
      <IconButton 
        icon={Download} 
        label="Download" 
        onClick={onDownload} 
        disabled={!hasFileSelected}
      />

      <div className="flex-1"></div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="p-1.5 bg-surface hover:bg-background border border-border rounded-md text-text_secondary hover:text-text_primary transition-colors shadow-sm"
        title="Refresh"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default ActionToolbar;
