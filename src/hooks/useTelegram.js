import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sendMessage as sendTelegramMessage, sendDocument, downloadFileById } from '../lib/telegramAPI';

export const useTelegram = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(async (text) => {
    try {
      setIsLoading(true);
      clearError();

      // Get user ID from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Send message to Telegram
      const botToken = import.meta.env.VITE_BOT_TOKEN;
      const chatId = import.meta.env.VITE_CHAT_ID;
      
      const telegramResponse = await sendTelegramMessage(botToken, chatId, text);
      
      if (!telegramResponse.ok) {
        throw new Error(`Telegram API error: ${telegramResponse.description}`);
      }

      // Store message metadata in Supabase
      const { data: messageData, error: insertError } = await supabase
        .from('message_metadata')
        .insert({
          user_id: user.id,
          telegram_message_id: telegramResponse.result.message_id,
          message_type: 'user',
          content: text,
          has_file: false,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to save message: ${insertError.message}`);
      }

      return {
        id: messageData.id,
        content: text,
        is_file: false,
        telegram_message_id: telegramResponse.result.message_id,
        timestamp: messageData.timestamp,
        message_type: messageData.message_type
      };

    } catch (err) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      console.error('Send message error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const sendFile = useCallback(async (file) => {
    try {
      setIsLoading(true);
      clearError();

      // Get user ID from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Send file to Telegram
      const botToken = import.meta.env.VITE_BOT_TOKEN;
      const chatId = import.meta.env.VITE_CHAT_ID;
      
      const telegramResponse = await sendDocument(botToken, chatId, file);
      
      if (!telegramResponse.ok) {
        throw new Error(`Telegram API error: ${telegramResponse.description}`);
      }

      const document = telegramResponse.result.document;

      // Store file metadata in Supabase
      const { data: fileData, error: insertError } = await supabase
        .from('message_metadata')
        .insert({
          user_id: user.id,
          telegram_message_id: telegramResponse.result.message_id,
          message_type: 'user',
          content: document.file_name,
          has_file: true,
          file_type: document.mime_type,
          deleted: false,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to save file metadata: ${insertError.message}`);
      }

      return {
        id: fileData.id,
        content: document.file_name,
        is_file: true,
        file_name: document.file_name,
        file_type: document.mime_type,
        file_size: document.file_size,
        telegram_file_id: document.file_id,
        telegram_message_id: telegramResponse.result.message_id,
        timestamp: fileData.timestamp,
        message_type: fileData.message_type
      };

    } catch (err) {
      const errorMessage = err.message || 'Failed to send file';
      setError(errorMessage);
      console.error('Send file error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      // Get user ID from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get bot token and chat ID
      const botToken = import.meta.env.VITE_BOT_TOKEN;
      const chatId = import.meta.env.VITE_CHAT_ID;

      // Fetch messages from Telegram API using getUpdates
      // Note: For self-chat, we need to use a different approach since getUpdates is for bots
      // We'll fetch message history from the chat
      try {
        // First, get the latest message from our database to know where to start from
        const { data: lastMessage } = await supabase
          .from('message_metadata')
          .select('telegram_message_id')
          .eq('user_id', user.id)
          .order('telegram_message_id', { ascending: false })
          .limit(1)
          .single();

        // Use the proxy to fetch recent messages from Telegram
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            botToken,
            method: 'getUpdates',
            body: {
              offset: lastMessage ? lastMessage.telegram_message_id + 1 : 0,
              limit: 50
            }
          })
        });

        const telegramData = await response.json();
        
        if (telegramData.ok && telegramData.result.length > 0) {
          // Process new messages from Telegram
          for (const update of telegramData.result) {
            if (update.message && update.message.chat.id.toString() === chatId) {
              const message = update.message;
              
              // Check if this message is already in our database
              const { data: existingMessage } = await supabase
                .from('message_metadata')
                .select('id')
                .eq('telegram_message_id', message.message_id)
                .eq('user_id', user.id)
                .single();

              if (!existingMessage) {
                // Determine message content and file info
                let content = message.text || '';
                let hasFile = false;
                let fileType = null;
                let fileName = '';

                // Handle different types of media
                if (message.document) {
                  content = message.document.file_name || 'Document';
                  hasFile = true;
                  fileType = message.document.mime_type;
                  fileName = message.document.file_name;
                } else if (message.photo) {
                  content = 'Photo';
                  hasFile = true;
                  fileType = 'image/jpeg';
                  fileName = `photo_${message.message_id}.jpg`;
                } else if (message.video) {
                  content = message.video.file_name || 'Video';
                  hasFile = true;
                  fileType = message.video.mime_type;
                  fileName = message.video.file_name;
                } else if (message.audio) {
                  content = message.audio.file_name || 'Audio';
                  hasFile = true;
                  fileType = message.audio.mime_type;
                  fileName = message.audio.file_name;
                } else if (message.voice) {
                  content = 'Voice message';
                  hasFile = true;
                  fileType = 'audio/ogg';
                  fileName = `voice_${message.message_id}.ogg`;
                } else if (message.sticker) {
                  content = message.sticker.emoji || 'Sticker';
                  hasFile = false;
                } else if (message.animation) {
                  content = 'GIF';
                  hasFile = true;
                  fileType = 'image/gif';
                  fileName = `gif_${message.message_id}.gif`;
                }

                // Store the received message
                const messageData = {
                  user_id: user.id,
                  telegram_message_id: message.message_id,
                  message_type: 'bot', // This is from the bot
                  content: content,
                  has_file: hasFile,
                  file_type: fileType,
                  deleted: false,
                  timestamp: new Date(message.date * 1000).toISOString()
                };

                await supabase
                  .from('message_metadata')
                  .insert(messageData);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching from Telegram:', error);
        // Continue with database messages even if Telegram fetch fails
      }

      // Now fetch all messages from Supabase (both sent and received)
      const { data: messages, error: fetchError } = await supabase
        .from('message_metadata')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch messages: ${fetchError.message}`);
      }

      // Process messages for display
      const processedMessages = messages.map((message) => {
        return {
          id: message.id,
          content: message.content,
          is_file: message.has_file,
          file_name: message.content,
          file_type: message.file_type,
          telegram_message_id: message.telegram_message_id,
          timestamp: message.timestamp,
          message_type: message.message_type // 'user' or 'bot'
        };
      });

      return processedMessages;

    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch messages';
      setError(errorMessage);
      console.error('Fetch messages error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const getFile = useCallback(async (telegramFileId) => {
    try {
      setIsLoading(true);
      clearError();

      const botToken = import.meta.env.VITE_BOT_TOKEN;
      
      // Download file directly using file_id
      return await downloadFileById(botToken, telegramFileId);

    } catch (err) {
      const errorMessage = err.message || 'Failed to download file';
      setError(errorMessage);
      console.error('Get file error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const deleteMessage = useCallback(async (messageId) => {
    try {
      setIsLoading(true);
      clearError();

      // Get user ID from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Hard delete message in Supabase (until migration adds deleted field)
      const { error: deleteError } = await supabase
        .from('message_metadata')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw new Error(`Failed to delete message: ${deleteError.message}`);
      }

      return true;

    } catch (err) {
      const errorMessage = err.message || 'Failed to delete message';
      setError(errorMessage);
      console.error('Delete message error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  return {
    sendMessage,
    sendFile,
    fetchMessages,
    getFile,
    deleteMessage,
    isLoading,
    error,
    clearError
  };
};
