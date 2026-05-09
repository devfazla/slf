import { useState, useEffect } from 'react';

const UrlPromptDialog = ({ isOpen, onClose, onAdd, type = 'image' }) => {
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setAltText('');
      setError('');
      setIsValidating(false);
      setIsValid(false);
    }
  }, [isOpen]);

  // Real-time URL validation as user types
  useEffect(() => {
    if (url.trim()) {
      const validation = validateUrl(url);
      setIsValid(validation.valid);
      if (!validation.valid && url.length > 8) { // Only show error after typing a bit
        setError(validation.error);
      } else {
        setError('');
      }
    } else {
      setIsValid(false);
      setError('');
    }
  }, [url]);

  if (!isOpen) return null;

  const validateUrl = (urlString) => {
    const trimmedUrl = urlString.trim();
    
    // Basic format check - must start with http:// or https://
    if (!trimmedUrl.match(/^https?:\/\//i)) {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    
    // Comprehensive URL validation pattern
    const urlPattern = /^https?:\/\/(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?::\d+)?(?:\/[^\s]*)?$/i;
    
    if (!urlPattern.test(trimmedUrl)) {
      return { valid: false, error: 'Please enter a valid URL (e.g., https://example.com or http://localhost:3000)' };
    }
    
    // Additional checks for common invalid patterns
    if (trimmedUrl.includes('..') || trimmedUrl.includes('//') && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return { valid: false, error: 'URL contains invalid characters or format' };
    }
    
    return { valid: true, error: null };
  };

  const handleAdd = async () => {
    if (!url.trim()) return;

    const trimmedUrl = url.trim();
    const validation = validateUrl(trimmedUrl);
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (type === 'image') {
      setIsValidating(true);
      setError('');
      
      const img = new window.Image();
      img.onload = () => {
        setIsValidating(false);
        onAdd(trimmedUrl, altText.trim());
        onClose();
      };
      img.onerror = () => {
        setIsValidating(false);
        setError('Invalid image URL. The link did not return an image.');
      };
      img.src = trimmedUrl;
    } else {
      // For standard links, regex validation is enough. Fetching causes CORS/timeout issues.
      onAdd(trimmedUrl, altText.trim());
      onClose();
    }
  };

  const title = type === 'image' ? 'Insert Image' : 'Insert Link';
  const desc = type === 'image' 
    ? 'Paste the URL of the image you want to insert.' 
    : 'Paste the URL for the link.';
  const placeholder = type === 'image' ? 'https://example.com/image.png' : 'https://example.com';
  const altPlaceholder = type === 'image' ? 'Alt text (optional)' : 'Link text (optional)';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text_primary mb-2">{title}</h3>
          <p className="text-sm text-text_tertiary mb-4">{desc}</p>
          
          <div className="space-y-3">
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') onClose();
              }}
              placeholder={placeholder}
              className={`w-full px-4 py-2 bg-background border rounded-lg text-text_primary placeholder:text-text_tertiary focus:outline-none focus:ring-2 transition-all ${
                error 
                  ? 'border-danger focus:ring-danger/50' 
                  : isValid && url.trim()
                    ? 'border-success focus:ring-success/50'
                    : 'border-border focus:ring-primary/50'
              }`}
              autoFocus
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') onClose();
              }}
              placeholder={altPlaceholder}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text_primary placeholder:text-text_tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
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
            disabled={!url.trim() || isValidating || !isValid}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-background hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? 'Validating...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlPromptDialog;
