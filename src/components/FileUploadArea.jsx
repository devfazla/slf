import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

const FileUploadArea = ({ onUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (files) => {
    // Process files one by one (or could be modified to handle bulk array)
    files.forEach(file => {
      onUpload(file);
    });
  };

  return (
    <div
      className={`relative w-full border-2 border-dashed rounded-xl transition-colors ${
        disabled 
          ? 'border-border/50 bg-background/50 cursor-not-allowed opacity-60' 
          : isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-surface/50 cursor-pointer'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <UploadCloud className={`h-10 w-10 mb-3 ${isDragging ? 'text-primary' : 'text-text_secondary'}`} />
        <p className="text-sm font-medium text-text_primary mb-1">
          Click or drag files here to upload
        </p>
        <p className="text-xs text-text_secondary">
          Support for documents, images, videos, and more.
        </p>
      </div>
    </div>
  );
};

export default FileUploadArea;
