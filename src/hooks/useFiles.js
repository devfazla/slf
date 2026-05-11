import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sendDocument, downloadFileById } from '../lib/telegramAPI';

export const useFiles = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getFilesInFolder = useCallback(async (folderId = null) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (folderId) {
        query = query.eq('folder_id', folderId);
      } else {
        query = query.is('folder_id', null);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw new Error(`Failed to fetch files: ${fetchError.message}`);

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('getFilesInFolder error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const uploadFile = useCallback(async (file, folderId = null) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const botToken = import.meta.env.VITE_BOT_TOKEN;
      const chatId = import.meta.env.VITE_CHAT_ID;

      // 1. Upload to Telegram
      const telegramResponse = await sendDocument(botToken, chatId, file);
      
      if (!telegramResponse.ok) {
        throw new Error(`Telegram API error: ${telegramResponse.description}`);
      }

      const document = telegramResponse.result.document;

      // 2. Save metadata to Supabase 'files' table
      const { data: fileData, error: insertError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: document.file_name || file.name,
          file_type: file.name.split('.').pop() || 'unknown',
          telegram_file_id: document.file_id,
          folder_id: folderId,
          size_bytes: document.file_size || file.size,
          mime_type: document.mime_type || file.type,
          others: {}
        })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to save file metadata: ${insertError.message}`);

      return fileData;
    } catch (err) {
      setError(err.message);
      console.error('uploadFile error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const downloadFile = useCallback(async (telegramFileId, fileName) => {
    try {
      setIsLoading(true);
      clearError();

      // Validate telegram_file_id
      if (!telegramFileId || typeof telegramFileId !== 'string' || telegramFileId.trim() === '') {
        throw new Error('Invalid file ID: telegram_file_id is required and must be a non-empty string');
      }

      const botToken = import.meta.env.VITE_BOT_TOKEN;
      
      // Download file blob
      const blob = await downloadFileById(botToken, telegramFileId.trim());
      
      // Create a temporary link to download the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('downloadFile error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const renameFile = useCallback(async (fileId, newName) => {
    try {
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: updateError } = await supabase
        .from('files')
        .update({ name: newName })
        .eq('id', fileId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to rename file: ${updateError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('renameFile error:', err);
      throw err;
    }
  }, [clearError]);

  const deleteFile = useCallback(async (fileId) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (deleteError) throw new Error(`Failed to delete file: ${deleteError.message}`);

      return true;
    } catch (err) {
      setError(err.message);
      console.error('deleteFile error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const moveFile = useCallback(async (fileId, newFolderId) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: updateError } = await supabase
        .from('files')
        .update({ folder_id: newFolderId })
        .eq('id', fileId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to move file: ${updateError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('moveFile error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const copyFile = useCallback(async (file, targetFolderId) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: `${file.name.split('.').slice(0, -1).join('.') || file.name} - Copy.${file.file_type}`,
          file_type: file.file_type,
          telegram_file_id: file.telegram_file_id,
          folder_id: targetFolderId,
          size_bytes: file.size_bytes,
          mime_type: file.mime_type,
          others: file.others || {}
        })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to copy file: ${insertError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('copyFile error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  return {
    getFilesInFolder,
    uploadFile,
    downloadFile,
    renameFile,
    deleteFile,
    moveFile,
    copyFile,
    isLoading,
    error,
    clearError
  };
};
