import { useState, useCallback, useEffect } from 'react';
import { useFolders } from './useFolders';
import { useFiles } from './useFiles';

export const useExplorer = () => {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentPath, setCurrentPath] = useState([{ id: null, name: 'Home' }]);
  const [items, setItems] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // [{ id, itemType }]

  const { 
    getFolderContents, 
    getAllFolders,
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
      
      const [folders, files, allFoldersData] = await Promise.all([
        getFolderContents(currentFolderId),
        getFilesInFolder(currentFolderId),
        getAllFolders()
      ]);

      const formattedFolders = folders.map(f => ({ ...f, itemType: 'folder' }));
      const formattedFiles = files.map(f => ({ ...f, itemType: 'file' }));

      setItems([...formattedFolders, ...formattedFiles]);
      setAllFolders(allFoldersData);
    } catch (err) {
      console.error('Failed to refresh explorer contents:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentFolderId, getFolderContents, getFilesInFolder, getAllFolders]);

  // Initial load and folder change load
  useEffect(() => {
    refreshContents();
  }, [currentFolderId]);

  const navigateToFolder = useCallback(async (folderId, folderName) => {
    setCurrentFolderId(folderId);
    setSelectedItems([]); // Clear selection on navigation
    
    if (folderId === null) {
      setCurrentPath([{ id: null, name: 'Home' }]);
      return;
    }

    // Always attempt to reconstruct the full path from allFolders
    if (allFolders.length > 0) {
      const path = [];
      let current = allFolders.find(f => f.id === folderId);
      
      if (current) {
        while (current) {
          path.unshift({ id: current.id, name: current.name });
          current = allFolders.find(f => f.id === current.parent_id);
        }
        path.unshift({ id: null, name: 'Home' });
        setCurrentPath(path);
        return;
      }
    }

    // Fallback if allFolders isn't loaded yet or folder not found
    try {
      const dbFolder = await getFolder(folderId);
      if (dbFolder) {
        // If we can't reconstruct the whole path yet, at least show Home > ... > current
        // This is a temporary state until allFolders loads
        setCurrentPath([{ id: null, name: 'Home' }, { id: dbFolder.id, name: dbFolder.name }]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [allFolders, getFolder]);

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
      setSelectedItems([]); // Clear selection
    }
  }, [currentPath]);

  const toggleSelection = useCallback((id, itemType, isMulti = false) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(item => item.id === id && item.itemType === itemType);
      
      if (isMulti) {
        if (isSelected) {
          return prev.filter(item => !(item.id === id && item.itemType === itemType));
        } else {
          return [...prev, { id, itemType }];
        }
      } else {
        return isSelected && prev.length === 1 ? [] : [{ id, itemType }];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  return {
    currentFolderId,
    currentPath,
    items,
    allFolders,
    isLoading,
    error,
    refreshContents,
    navigateToFolder,
    goBack,
    goToRoot,
    navigateToPathIndex,
    selectedItems,
    toggleSelection,
    clearSelection
  };
};
