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

const FileItem = ({ file, onDownload, onRename, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDownload = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDownload(file);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onRename(file);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(file);
  };

  return (
    <div className="relative flex flex-col items-center p-4 bg-surface rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          className="p-1 hover:bg-background rounded-md text-text_secondary hover:text-text_primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-border rounded-lg shadow-xl py-1 z-10">
            <button 
              className="w-full flex items-center px-3 py-1.5 text-sm hover:bg-background transition-colors"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5 mr-2 text-text_secondary" />
              Download
            </button>
            <button 
              className="w-full flex items-center px-3 py-1.5 text-sm hover:bg-background transition-colors"
              onClick={handleRename}
            >
              <Edit2 className="h-3.5 w-3.5 mr-2 text-text_secondary" />
              Rename
            </button>
            <button 
              className="w-full flex items-center px-3 py-1.5 text-sm hover:bg-background text-danger transition-colors"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {getFileIcon(file.file_type, file.mime_type)}
      </div>
      
      <div className="text-center w-full mt-auto">
        <p className="text-sm font-medium text-text_primary truncate w-full px-1" title={file.name}>
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
