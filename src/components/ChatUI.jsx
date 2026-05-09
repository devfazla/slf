import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Download, File, X, RefreshCw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../hooks/useAuth';

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds

const ChatUI = ({ onPollingChange, onSyncComplete, refreshTrigger }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const isPollingRef = useRef(false); // Guard against overlapping polls
  const messagesRef = useRef([]); // Keep a ref to current messages for dedup
  const { sendMessage, sendFile, fetchMessages, pollNewMessages, subscribeToMessages } = useTelegram();
  const { userId } = useAuth();

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initial message load
  useEffect(() => {
    loadMessages();
  }, []);

  const performSync = useCallback(async () => {
    if (isPollingRef.current) return;
    
    isPollingRef.current = true;
    setIsPolling(true);
    if (onPollingChange) onPollingChange(true);

    try {
      const newMsgs = await pollNewMessages();
      if (newMsgs && newMsgs.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = newMsgs.filter(m => !existingIds.has(m.id));
          if (uniqueNew.length === 0) return prev;
          return [...prev, ...uniqueNew];
        });
      }
      if (onSyncComplete) onSyncComplete(new Date());
    } catch (err) {
      console.error('Polling error:', err);
    } finally {
      isPollingRef.current = false;
      setIsPolling(false);
      if (onPollingChange) onPollingChange(false);
    }
  }, [pollNewMessages, onPollingChange, onSyncComplete]);

  // Handle manual refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      performSync();
    }
  }, [refreshTrigger, performSync]);

  // Setup polling + Supabase Realtime on mount, cleanup on unmount
  useEffect(() => {
    // Don't start polling until initial load is done
    if (isLoading) return;

    // --- Telegram Polling ---
    const startPolling = () => {
      // Clear any existing interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = setInterval(() => {
        performSync();
      }, POLL_INTERVAL_MS);
    };

    startPolling();

    // --- Supabase Realtime Subscription ---
    const unsubscribe = subscribeToMessages((newMsg) => {
      setMessages(prev => {
        // Deduplicate: check by id or telegram_message_id
        const exists = prev.some(
          m => m.id === newMsg.id || 
               (m.telegram_message_id && m.telegram_message_id === newMsg.telegram_message_id)
        );
        if (exists) return prev;
        return [...prev, newMsg];
      });
      if (onSyncComplete) onSyncComplete(new Date());
    });

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isLoading, performSync, subscribeToMessages, onSyncComplete]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const messageList = await fetchMessages();
      setMessages(messageList || []);
      if (onSyncComplete) onSyncComplete(new Date());
    } catch (error) {
      console.error('Failed to load messages:', error);
      alert(`Failed to load messages: ${error.message || 'Network error.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    try {
      setIsSending(true);
      setSendingProgress({ type: 'text', status: 'sending', progress: 0 });
      
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: text,
        is_file: false,
        timestamp: new Date().toISOString(),
        is_sending: true,
        message_type: 'user'
      };
      setMessages(prev => [...prev, tempMessage]);

      const newMessage = await sendMessage(text);
      if (newMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...newMessage, is_sending: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => !msg.is_sending));
      alert(`Failed to send message: ${error.message || 'Network error.'}`);
    } finally {
      setIsSending(false);
      setSendingProgress(null);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setIsSending(true);
      setSendingProgress({ type: 'file', status: 'sending', progress: 0, fileName: file.name });
      
      const tempFileMessage = {
        id: `temp-file-${Date.now()}`,
        content: file.name,
        is_file: true,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        timestamp: new Date().toISOString(),
        is_sending: true,
        message_type: 'user'
      };
      setMessages(prev => [...prev, tempFileMessage]);

      const fileMessage = await sendFile(file);
      if (fileMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempFileMessage.id 
            ? { ...fileMessage, is_sending: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      setMessages(prev => prev.filter(msg => !msg.is_sending));
      alert(`Failed to upload file: ${error.message || 'Network error.'}`);
    } finally {
      setIsSending(false);
      setSendingProgress(null);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-text_secondary">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background relative">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-text_secondary mt-8">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Start a conversation by sending a message or file</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
              timestamp={formatTimestamp(message.timestamp || message.created_at)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4 flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          disabled={isSending}
        />
      </div>
    </div>
  );
};

export default ChatUI;
