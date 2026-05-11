import React, { useState } from 'react';
import { File, FileText, Image as ImageIcon, Video, Music, Archive, MoreVertical, Download, Edit2, Trash2 } from 'lucide-react';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getFileIcon = (fileType, mimeType) => {
  if (mimeType?.startsWith('image/')) return <ImageIcon className="h-10 w-10 text-blue-500 mb-3" />;
  if (mimeType?.startsWith('video/')) return <Video className="h-10 w-10 text-purple-500 mb-3" />;
  if (mimeType?.startsWith('audio/')) return <Music className="h-10 w-10 text-pink-500 mb-3" />;
  
  const ext = fileType?.toLowerCase();
  switch (ext) {
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'md':
      return <FileText className="h-10 w-10 text-gray-500 mb-3" />;
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return <Archive className="h-10 w-10 text-yellow-500 mb-3" />;
    default:
      return <File className="h-10 w-10 text-text_secondary mb-3" />;
  }
};

const FileItem = ({ 
  file, 
  onDownload, 
  isSelected, 
  onSelect, 
  onContextMenu 
}) => {
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, file, 'file');
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(file.id, 'file', e.ctrlKey || e.metaKey);
  };

  return (
    <div 
      className={`relative flex flex-col items-center p-4 rounded-xl border transition-all group select-none h-40 ${
        isSelected 
          ? 'bg-primary/10 border-primary shadow-sm' 
          : 'bg-surface border-border hover:border-primary/50 hover:shadow-md'
      }`}
      onClick={handleClick}
      onDoubleClick={handleContextMenu}
      onContextMenu={handleContextMenu}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {getFileIcon(file.file_type, file.mime_type)}
      </div>
      
      <div className="text-center w-full mt-auto">
        <p className={`text-sm font-medium truncate w-full px-1 ${isSelected ? 'text-primary' : 'text-text_primary'}`} title={file.name}>
          {file.name}
        </p>
        <div className="flex justify-between items-center px-1 mt-1">
          <p className="text-[10px] text-text_secondary">
            {formatBytes(file.size_bytes)}
          </p>
          <p className="text-[10px] text-text_secondary">
            {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileItem;
