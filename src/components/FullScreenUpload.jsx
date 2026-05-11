import React, { useState, useEffect } from 'react';
import { Upload, X, File, Loader2 } from 'lucide-react';

const FullScreenUpload = ({ isOpen, onClose, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setIsDragging(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    selectedFiles.forEach(file => onUpload(file));
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`relative w-full max-w-2xl bg-surface border-2 border-dashed rounded-2xl p-8 transition-all ${
        isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border'
      }`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-background rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-text_secondary" />
        </button>

        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Upload className={`h-10 w-10 text-primary ${isDragging ? 'animate-bounce' : ''}`} />
          </div>
          
          <h2 className="text-2xl font-bold text-text_primary mb-2">Upload Files</h2>
          <p className="text-text_secondary mb-8">
            Drag and drop files here, or click to select from your device
          </p>

          {selectedFiles.length > 0 ? (
            <div className="w-full mb-8">
              <div className="max-h-60 overflow-y-auto space-y-2 px-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center p-3 bg-background rounded-lg border border-border">
                    <File className="h-5 w-5 text-blue-500 mr-3" />
                    <div className="flex-1 text-left truncate">
                      <p className="text-sm font-medium text-text_primary truncate">{file.name}</p>
                      <p className="text-xs text-text_secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleUpload}
                className="mt-6 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg"
              >
                Start Uploading {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
              </button>
            </div>
          ) : (
            <label className="w-full">
              <input 
                type="file" 
                className="hidden" 
                multiple 
                onChange={handleFileChange}
              />
              <div className="w-full py-4 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors font-medium">
                Select Files
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullScreenUpload;
