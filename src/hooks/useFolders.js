import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useFolders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getFolderContents = useCallback(async (folderId = null) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      let query = supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (folderId) {
        query = query.eq('parent_id', folderId);
      } else {
        query = query.is('parent_id', null);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw new Error(`Failed to fetch folders: ${fetchError.message}`);

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('getFolderContents error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const createFolder = useCallback(async (parentId = null, name) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: name,
          parent_id: parentId,
          color: '#ffffff',
          others: {}
        })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to create folder: ${insertError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('createFolder error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const renameFolder = useCallback(async (folderId, newName) => {
    try {
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: updateError } = await supabase
        .from('folders')
        .update({ name: newName })
        .eq('id', folderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to rename folder: ${updateError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('renameFolder error:', err);
      throw err;
    }
  }, [clearError]);

  const deleteFolder = useCallback(async (folderId) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error: deleteError } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', user.id);

      if (deleteError) throw new Error(`Failed to delete folder: ${deleteError.message}`);

      return true;
    } catch (err) {
      setError(err.message);
      console.error('deleteFolder error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const getFolder = useCallback(async (folderId) => {
    if (!folderId) return null;
    
    try {
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: fetchError } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw new Error(`Failed to fetch folder: ${fetchError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('getFolder error:', err);
      throw err;
    }
  }, [clearError]);

  const getAllFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: fetchError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (fetchError) throw new Error(`Failed to fetch all folders: ${fetchError.message}`);

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('getAllFolders error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const moveFolder = useCallback(async (folderId, newParentId) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: updateError } = await supabase
        .from('folders')
        .update({ parent_id: newParentId })
        .eq('id', folderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to move folder: ${updateError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('moveFolder error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const copyFolder = useCallback(async (folderId, targetParentId) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // 1. Get source folder
      const sourceFolder = await getFolder(folderId);
      if (!sourceFolder) throw new Error('Source folder not found');

      // 2. Create new folder
      const newFolderName = `${sourceFolder.name} - Copy`;
      const newFolder = await createFolder(targetParentId, newFolderName);

      // Note: Recursive copy of contents would go here
      // For now, we just copy the folder itself to keep it simple
      // Full recursive copy would require fetching all children and copying them too.

      return newFolder;
    } catch (err) {
      setError(err.message);
      console.error('copyFolder error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, getFolder, createFolder]);

  return {
    getFolderContents,
    getAllFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    copyFolder,
    getFolder,
    isLoading,
    error,
    clearError
  };
};
