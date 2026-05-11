import React, { useState, useCallback, useEffect } from 'react';
import { useExplorer } from '../hooks/useExplorer';
import { useFolders } from '../hooks/useFolders';
import { useFiles } from '../hooks/useFiles';
import FolderNav from './FolderNav';
import FolderView from './FolderView';
import CreateFolderModal from './CreateFolderModal';
import ActionToolbar from './ActionToolbar';
import FolderTree from './FolderTree';
import ContextMenu from './ContextMenu';
import FullScreenUpload from './FullScreenUpload';
import DetailsModal from './DetailsModal';

const FileExplorer = () => {
  const {
    currentFolderId,
    currentPath,
    items,
    allFolders,
    isLoading: isLoadingExplorer,
    refreshContents,
    navigateToFolder,
    navigateToPathIndex,
    selectedItems,
    toggleSelection,
    clearSelection
  } = useExplorer();

  const { createFolder, renameFolder, deleteFolder, moveFolder, copyFolder } = useFolders();
  const { uploadFile, downloadFile, renameFile, deleteFile, moveFile, copyFile } = useFiles();

  // Modals/Dialogs State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [fileToRename, setFileToRename] = useState(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  // Clipboard & Context Menu State
  const [clipboard, setClipboard] = useState({ items: [], action: null }); // action: 'copy' | 'move'
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type, item }

  // Handlers for Folder Operations
  const handleCreateFolder = async (name) => {
    try {
      await createFolder(currentFolderId, name);
      refreshContents();
      setIsFolderModalOpen(false);
    } catch (err) {
      console.error('Create folder error:', err);
    }
  };

  const handleCreateFile = async (name) => {
    try {
      // Create a small placeholder text file
      const blob = new Blob(['Empty file'], { type: 'text/plain' });
      const file = new File([blob], name.endsWith('.txt') ? name : `${name}.txt`, { type: 'text/plain' });
      await uploadFile(file, currentFolderId);
      refreshContents();
      setIsNewFileModalOpen(false);
    } catch (err) {
      console.error('Create file error:', err);
    }
  };

  const handleRenameSubmit = async (newName) => {
    try {
      if (folderToRename) {
        await renameFolder(folderToRename.id, newName);
      } else if (fileToRename) {
        await renameFile(fileToRename.id, newName);
      }
      refreshContents();
      setFolderToRename(null);
      setFileToRename(null);
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const handleDeleteItem = async (item, itemType) => {
    const confirmMsg = `Are you sure you want to delete the ${itemType} "${item.name}"? This action cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      try {
        if (itemType === 'folder') {
          await deleteFolder(item.id);
        } else {
          await deleteFile(item.id);
        }
        refreshContents();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  // Clipboard Actions
  const handleCopy = () => {
    if (selectedItems.length > 0) {
      const itemsToCopy = items.filter(item => 
        selectedItems.some(si => si.id === item.id && si.itemType === item.itemType)
      );
      setClipboard({ items: itemsToCopy, action: 'copy' });
    }
  };

  const handleMove = () => {
    if (selectedItems.length > 0) {
      const itemsToMove = items.filter(item => 
        selectedItems.some(si => si.id === item.id && si.itemType === item.itemType)
      );
      setClipboard({ items: itemsToMove, action: 'move' });
    }
  };

  const handlePaste = async () => {
    if (!clipboard.action || clipboard.items.length === 0) return;

    try {
      for (const item of clipboard.items) {
        if (clipboard.action === 'move') {
          if (item.itemType === 'folder') {
            await moveFolder(item.id, currentFolderId);
          } else {
            await moveFile(item.id, currentFolderId);
          }
        } else if (clipboard.action === 'copy') {
          if (item.itemType === 'folder') {
            await copyFolder(item.id, currentFolderId);
          } else {
            await copyFile(item, currentFolderId);
          }
        }
      }
      refreshContents();
      if (clipboard.action === 'move') {
        setClipboard({ items: [], action: null });
      }
    } catch (err) {
      console.error('Paste error:', err);
      alert('Some items could not be pasted.');
    }
  };

  // Other Actions
  const handleDownload = async () => {
    const filesToDownload = items.filter(item => 
      item.itemType === 'file' && 
      selectedItems.some(si => si.id === item.id && si.itemType === 'file')
    );

    for (const file of filesToDownload) {
      try {
        await downloadFile(file.telegram_file_id, file.name);
      } catch (err) {
        console.error('Download error:', err);
      }
    }
  };

  const handleContextMenuAction = (action, item) => {
    switch (action) {
      case 'copy':
        // If item is provided, select only it first? 
        // For simplicity, we copy current selection if item is in it, or just item if not.
        if (item) {
          const isItemSelected = selectedItems.some(si => si.id === item.id);
          if (!isItemSelected) toggleSelection(item.id, item.itemType, false);
        }
        handleCopy();
        break;
      case 'move':
        if (item) {
          const isItemSelected = selectedItems.some(si => si.id === item.id);
          if (!isItemSelected) toggleSelection(item.id, item.itemType, false);
        }
        handleMove();
        break;
      case 'rename':
        if (item.itemType === 'folder') setFolderToRename(item);
        else setFileToRename(item);
        break;
      case 'delete':
        handleDeleteItem(item, item.itemType);
        break;
      case 'details':
        setDetailsItem({ ...item, type: item.itemType });
        break;
      case 'download':
        downloadFile(item.telegram_file_id, item.name);
        break;
      case 'paste':
        handlePaste();
        break;
      case 'upload':
        setIsUploadDialogOpen(true);
        break;
      case 'refresh':
        refreshContents();
        break;
      case 'newFolder':
        setIsFolderModalOpen(true);
        break;
      case 'newFile':
        setIsNewFileModalOpen(true);
        break;
      case 'dirDetails':
        setDetailsItem({ 
          name: currentPath[currentPath.length - 1].name, 
          created_at: new Date().toISOString(), // Mocking current dir date
          type: 'folder'
        });
        break;
      default:
        break;
    }
  };

  const onGlobalContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'empty',
      item: null
    });
  };

  const onItemContextMenu = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select the item if it's not already selected (only if item exists)
    if (item) {
      const isSelected = selectedItems.some(si => si.id === item.id && si.itemType === type);
      if (!isSelected) {
        toggleSelection(item.id, type, false);
      }
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: type,
      item: item
    });
  };

  const handleToolbarRename = () => {
    if (selectedItems.length === 1) {
      const si = selectedItems[0];
      const item = items.find(i => i.id === si.id && i.itemType === si.itemType);
      if (item) {
        if (si.itemType === 'folder') setFolderToRename(item);
        else setFileToRename(item);
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-full overflow-hidden relative"
      onClick={() => setContextMenu(null)}
      onContextMenu={onGlobalContextMenu}
    >
      <ActionToolbar 
        onRefresh={refreshContents}
        onNewFolder={() => setIsFolderModalOpen(true)}
        onNewFile={() => setIsNewFileModalOpen(true)}
        onUpload={() => setIsUploadDialogOpen(true)}
        onCopy={handleCopy}
        onMove={handleMove}
        onPaste={handlePaste}
        onRename={handleToolbarRename}
        onDownload={handleDownload}
        selectedItems={selectedItems}
        clipboardAction={clipboard.action}
        isLoading={isLoadingExplorer}
      />

      <div className="flex flex-1 overflow-hidden mt-5">
        <div className="w-52 border-r border-border overflow-y-auto overflow-x-auto hidden md:block shrink-0 custom-scrollbar relative">


          <FolderTree 
            allFolders={allFolders}
            currentFolderId={currentFolderId}
            onNavigate={navigateToFolder}
            selectedItems={selectedItems}
            onContextMenu={onItemContextMenu}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 md:pl-6 overflow-hidden">
          <div className="mb-5">
            <FolderNav 
              currentPath={currentPath} 
              navigateToPathIndex={navigateToPathIndex} 
            />
          </div>

          <div className="flex-1 overflow-y-auto pb-6">
            <FolderView 
              items={items}
              isLoading={isLoadingExplorer}
              onNavigate={navigateToFolder}
              selectedItems={selectedItems}
              onSelect={toggleSelection}
              onContextMenu={onItemContextMenu}
              onDownloadFile={downloadFile}
            />
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu 
          {...contextMenu} 
          onClose={() => setContextMenu(null)} 
          onAction={handleContextMenuAction}
          clipboardAction={clipboard.action}
        />
      )}

      {/* Modals */}
      <CreateFolderModal 
        isOpen={isFolderModalOpen || !!folderToRename || !!fileToRename}
        onClose={() => {
          setIsFolderModalOpen(false);
          setFolderToRename(null);
          setFileToRename(null);
        }}
        onCreate={(name) => {
          if (folderToRename || fileToRename) handleRenameSubmit(name);
          else handleCreateFolder(name);
        }}
        initialName={folderToRename?.name || fileToRename?.name || ''}
      />

      <CreateFolderModal 
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onCreate={handleCreateFile}
        title="Create New File"
        placeholder="Enter file name (e.g. note.txt)"
      />

      <FullScreenUpload 
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={(file) => {
          uploadFile(file, currentFolderId).then(() => refreshContents());
        }}
      />

      <DetailsModal 
        isOpen={!!detailsItem}
        onClose={() => setDetailsItem(null)}
        item={detailsItem}
        type={detailsItem?.type}
      />
    </div>
  );
};

export default FileExplorer;
