import React, { useState } from 'react';
import { File, Download, Image, FileText, Archive, Music, Video, Code } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

const FileAttachment = ({ fileName, fileSize, telegramFileId, fileType }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { getFile } = useTelegram();

  const getFileIcon = (fileName, fileType) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
      return <Image className="w-5 h-5 text-green-500" />;
    }
    
    // Document files
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <Archive className="w-5 h-5 text-yellow-500" />;
    }
    
    // Audio files
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension)) {
      return <Music className="w-5 h-5 text-purple-500" />;
    }
    
    // Video files
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'].includes(extension)) {
      return <Video className="w-5 h-5 text-red-500" />;
    }
    
    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(extension)) {
      return <Code className="w-5 h-5 text-orange-500" />;
    }
    
    // Default file icon
    return <File className="w-5 h-5 text-text_secondary" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleDownload = async () => {
    if (!telegramFileId) return;
    
    try {
      setIsDownloading(true);
      const blob = await getFile(telegramFileId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      // You could show a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-surface2 rounded-lg border border-border hover:border-border/80 transition-colors">
      {/* File Icon */}
      <div className="flex-shrink-0">
        {getFileIcon(fileName, fileType)}
      </div>
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text_primary truncate" title={fileName}>
          {fileName}
        </p>
        <p className="text-xs text-text_tertiary">
          {formatFileSize(fileSize)}
        </p>
      </div>
      
      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={!telegramFileId || isDownloading}
        className="p-2 text-text_secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download file"
      >
        {isDownloading ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default FileAttachment;
