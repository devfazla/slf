import React from 'react';
import { File, Download, X } from 'lucide-react';
import FileAttachment from './FileAttachment';

const MessageBubble = ({ message, timestamp }) => {
  const isFile = message.is_file || message.file_name;
  const fileName = message.file_name || message.content;
  const fileSize = message.file_size;
  const isUser = message.message_type === 'user'; // Check if message is from user or bot

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      } ${message.is_sending ? 'opacity-75' : ''}`}>
        {message.is_sending && (
          <div className="flex items-center space-x-2 text-xs mb-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
            <span>Sending...</span>
          </div>
        )}
        {isFile ? (
          <div className="flex items-center space-x-2">
            <File className="w-4 h-4" />
            <span className="text-sm font-medium">{fileName}</span>
            {fileSize && (
              <span className="text-xs opacity-70">
                ({(fileSize / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        <div className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
