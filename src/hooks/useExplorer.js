import { useState, useCallback, useEffect } from 'react';
import { useFolders } from './useFolders';
import { useFiles } from './useFiles';

export const useExplorer = () => {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentPath, setCurrentPath] = useState([{ id: null, name: 'Home' }]);
  const [items, setItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    getFolderContents, 
    getFolder, 
    isLoading: isLoadingFolders,
    error: foldersError
  } = useFolders();

  const { 
    getFilesInFolder,
    isLoading: isLoadingFiles,
    error: filesError
  } = useFiles();

  const isLoading = isLoadingFolders || isLoadingFiles || isRefreshing;
  const error = foldersError || filesError;

  const refreshContents = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      const [folders, files] = await Promise.all([
        getFolderContents(currentFolderId),
        getFilesInFolder(currentFolderId)
      ]);

      const formattedFolders = folders.map(f => ({ ...f, itemType: 'folder' }));
      const formattedFiles = files.map(f => ({ ...f, itemType: 'file' }));

      setItems([...formattedFolders, ...formattedFiles]);
    } catch (err) {
      console.error('Failed to refresh explorer contents:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentFolderId, getFolderContents, getFilesInFolder]);

  // Initial load and folder change load
  useEffect(() => {
    refreshContents();
  }, [currentFolderId]);

  const navigateToFolder = useCallback(async (folderId, folderName) => {
    setCurrentFolderId(folderId);
    
    // Add to path if we have the name, otherwise we might need to fetch it (or reconstruct full path)
    if (folderName) {
      setCurrentPath(prev => {
        // Check if we are going to a sibling/cousin (rare in normal nav) or child
        // For simplicity, assuming we only navigate deeper via UI clicks
        const exists = prev.findIndex(p => p.id === folderId);
        if (exists >= 0) {
          // Navigating backwards via breadcrumb
          return prev.slice(0, exists + 1);
        } else {
          return [...prev, { id: folderId, name: folderName }];
        }
      });
    } else if (folderId !== null) {
      // Need to build path (e.g. if directly jumping)
      // This requires walking up parents, which might need a new DB function or multiple queries
      // For now, let's keep it simple: just fetch current folder
      try {
        const folder = await getFolder(folderId);
        if (folder) {
          // A bit hacky: doesn't build full tree if jumped directly
          setCurrentPath(prev => [...prev, { id: folder.id, name: folder.name }]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [getFolder]);

  const goBack = useCallback(() => {
    if (currentPath.length > 1) {
      const newPath = [...currentPath];
      newPath.pop(); // Remove current
      const targetFolder = newPath[newPath.length - 1];
      setCurrentFolderId(targetFolder.id);
      setCurrentPath(newPath);
    }
  }, [currentPath]);

  const goToRoot = useCallback(() => {
    setCurrentFolderId(null);
    setCurrentPath([{ id: null, name: 'Home' }]);
  }, []);

  const navigateToPathIndex = useCallback((index) => {
    if (index >= 0 && index < currentPath.length) {
      const targetFolder = currentPath[index];
      setCurrentFolderId(targetFolder.id);
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  }, [currentPath]);

  return {
    currentFolderId,
    currentPath,
    items,
    isLoading,
    error,
    refreshContents,
    navigateToFolder,
    goBack,
    goToRoot,
    navigateToPathIndex
  };
};
