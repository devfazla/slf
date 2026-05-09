import React, { useState } from 'react';
import { useExplorer } from '../hooks/useExplorer';
import { useFolders } from '../hooks/useFolders';
import { useFiles } from '../hooks/useFiles';
import FolderNav from './FolderNav';
import FolderView from './FolderView';
import CreateFolderModal from './CreateFolderModal';
import FileUploadArea from './FileUploadArea';
import { FolderPlus, RefreshCw } from 'lucide-react';

const FileExplorer = () => {
  const {
    currentFolderId,
    currentPath,
    items,
    isLoading: isLoadingExplorer,
    refreshContents,
    navigateToFolder,
    navigateToPathIndex
  } = useExplorer();

  const { createFolder, renameFolder, deleteFolder } = useFolders();
  const { uploadFile, downloadFile, renameFile, deleteFile } = useFiles();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [fileToRename, setFileToRename] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCreateFolder = async (name) => {
    try {
      await createFolder(currentFolderId, name);
      refreshContents();
      setIsFolderModalOpen(false);
    } catch (err) {
      console.error('Create folder error:', err);
      // Optional: Add a toast notification here
    }
  };

  const handleRenameFolderSubmit = async (newName) => {
    try {
      if (folderToRename) {
        await renameFolder(folderToRename.id, newName);
        refreshContents();
        setFolderToRename(null);
      } else if (fileToRename) {
        await renameFile(fileToRename.id, newName);
        refreshContents();
        setFileToRename(null);
      }
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"? This action cannot be undone.`)) {
      try {
        await deleteFolder(folder.id);
        refreshContents();
      } catch (err) {
        console.error('Delete folder error:', err);
      }
    }
  };

  const handleUploadFile = async (file) => {
    try {
      setIsUploading(true);
      await uploadFile(file, currentFolderId);
      refreshContents();
    } catch (err) {
      console.error('Upload file error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      await downloadFile(file.telegram_file_id, file.name);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDeleteFile = async (file) => {
    if (window.confirm(`Are you sure you want to delete the file "${file.name}"? This action cannot be undone.`)) {
      try {
        await deleteFile(file.id);
        refreshContents();
      } catch (err) {
        console.error('Delete file error:', err);
      }
    }
  };

  const isModalOpen = isFolderModalOpen || !!folderToRename || !!fileToRename;
  const modalInitialName = folderToRename?.name || fileToRename?.name || '';

  const handleModalClose = () => {
    setIsFolderModalOpen(false);
    setFolderToRename(null);
    setFileToRename(null);
  };

  const handleModalSubmit = (name) => {
    if (folderToRename || fileToRename) {
      handleRenameFolderSubmit(name);
    } else {
      handleCreateFolder(name);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <FolderNav 
          currentPath={currentPath} 
          navigateToPathIndex={navigateToPathIndex} 
        />
        
        <div className="flex gap-3">
          <button
            onClick={() => refreshContents()}
            className="p-2 bg-surface hover:bg-background border border-border rounded-lg text-text_secondary hover:text-text_primary transition-colors"
            title="Refresh"
            disabled={isLoadingExplorer}
          >
            <RefreshCw className={`h-5 w-5 ${isLoadingExplorer ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6 shrink-0">
        <FileUploadArea 
          onUpload={handleUploadFile} 
          disabled={isUploading}
        />
      </div>

      {/* Main View */}
      <div className="flex-1 overflow-y-auto pb-6">
        <FolderView 
          items={items}
          isLoading={isLoadingExplorer}
          onNavigate={navigateToFolder}
          onRenameFolder={(folder) => setFolderToRename(folder)}
          onDeleteFolder={handleDeleteFolder}
          onDownloadFile={handleDownloadFile}
          onRenameFile={(file) => setFileToRename(file)}
          onDeleteFile={handleDeleteFile}
        />
      </div>

      {/* Shared Modal for Create/Rename */}
      <CreateFolderModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCreate={handleModalSubmit}
        initialName={modalInitialName}
      />
    </div>
  );
};

export default FileExplorer;
