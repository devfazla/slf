import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Download, File, X } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../hooks/useAuth';

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { sendMessage, sendFile, fetchMessages } = useTelegram();
  const { userId } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const messageList = await fetchMessages();
      setMessages(messageList || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Show user-friendly error message
      alert(`Failed to load messages: ${error.message || 'Network error. Please check your internet connection and refresh the page.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    try {
      setIsSending(true);
      setSendingProgress({ type: 'text', status: 'sending', progress: 0 });
      
      // Add temporary message to show sending status
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: text,
        is_file: false,
        timestamp: new Date().toISOString(),
        is_sending: true
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
      // Remove temporary message and show error
      setMessages(prev => prev.filter(msg => !msg.is_sending));
      alert(`Failed to send message: ${error.message || 'Network error. Please check your internet connection and try again.'}`);
    } finally {
      setIsSending(false);
      setSendingProgress(null);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setIsSending(true);
      setSendingProgress({ type: 'file', status: 'sending', progress: 0, fileName: file.name });
      
      // Add temporary file message to show sending status
      const tempFileMessage = {
        id: `temp-file-${Date.now()}`,
        content: file.name,
        is_file: true,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        timestamp: new Date().toISOString(),
        is_sending: true
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
      // Remove temporary message and show error
      setMessages(prev => prev.filter(msg => !msg.is_sending));
      alert(`Failed to upload file: ${error.message || 'Network error. Please check your internet connection and try again.'}`);
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
    <div className="flex flex-col h-full bg-background">
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
