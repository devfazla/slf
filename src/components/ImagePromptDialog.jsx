import { useState, useEffect } from 'react';

const ImagePromptDialog = ({ isOpen, onClose, onAdd }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (url.trim()) {
      onAdd(url.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text_primary mb-2">Insert Image</h3>
          <p className="text-sm text-text_tertiary mb-4">Paste the URL of the image you want to insert.</p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') onClose();
            }}
            placeholder="https://example.com/image.png"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text_primary placeholder:text-text_tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            autoFocus
          />
        </div>
        <div className="bg-surface2 px-6 py-4 flex items-center justify-end space-x-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text_secondary hover:bg-surface hover:text-text_primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!url.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-background hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePromptDialog;
