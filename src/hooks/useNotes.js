import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * useNotes hook — Full CRUD for the notes table in Supabase.
 * All operations authenticate via supabase.auth.getUser().
 */
export const useNotes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetch all notes for the current user, ordered by updated_at DESC
   */
  const getNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw new Error(`Failed to fetch notes: ${fetchError.message}`);

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('getNotes error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  /**
   * Fetch a single note by ID
   */
  const getNote = useCallback(async (noteId) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw new Error(`Failed to fetch note: ${fetchError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('getNote error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  /**
   * Create a new note with a default title and empty content
   */
  const createNote = useCallback(async (title = 'Untitled Note') => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: title,
          content: '',
          is_favorite: false,
          tags: [],
          others: {}
        })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to create note: ${insertError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('createNote error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  /**
   * Update a note's title and/or content.
   * The updated_at column is auto-set by the DB trigger.
   */
  const updateNote = useCallback(async (noteId, updates) => {
    try {
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Only allow updating title and content
      const allowedFields = {};
      if (updates.title !== undefined) allowedFields.title = updates.title;
      if (updates.content !== undefined) allowedFields.content = updates.content;

      if (Object.keys(allowedFields).length === 0) return null;

      const { data, error: updateError } = await supabase
        .from('notes')
        .update(allowedFields)
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to update note: ${updateError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('updateNote error:', err);
      throw err;
    }
  }, [clearError]);

  /**
   * Hard delete a note by ID
   */
  const deleteNote = useCallback(async (noteId) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (deleteError) throw new Error(`Failed to delete note: ${deleteError.message}`);

      return true;
    } catch (err) {
      setError(err.message);
      console.error('deleteNote error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  /**
   * Search notes by title or content (case-insensitive)
   */
  const searchNotes = useCallback(async (query) => {
    try {
      setIsLoading(true);
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error: searchError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('updated_at', { ascending: false });

      if (searchError) throw new Error(`Failed to search notes: ${searchError.message}`);

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('searchNotes error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  /**
   * Toggle favorite status of a note
   */
  const toggleFavorite = useCallback(async (noteId) => {
    try {
      clearError();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // First get the current note to check its favorite status
      const { data: currentNote, error: fetchError } = await supabase
        .from('notes')
        .select('is_favorite')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw new Error(`Failed to fetch note: ${fetchError.message}`);

      // Toggle the favorite status
      const { data, error: updateError } = await supabase
        .from('notes')
        .update({ is_favorite: !currentNote.is_favorite })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to update favorite: ${updateError.message}`);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('toggleFavorite error:', err);
      throw err;
    }
  }, [clearError]);

  return {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    toggleFavorite,
    isLoading,
    error,
    clearError
  };
};
