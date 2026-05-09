import { useEffect, useCallback } from 'react';

/**
 * Hook for handling global keyboard shortcuts
 * @param {string} key - The key combination (e.g., 'ctrl+s', 'meta+s')
 * @param {Function} callback - The callback function to execute
 * @param {boolean} enabled - Whether the shortcut is enabled
 */
export const useGlobalShortcut = (key, callback, enabled = true) => {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Parse key combination
    const parts = key.toLowerCase().split('+');
    const ctrl = parts.includes('ctrl');
    const meta = parts.includes('meta');
    const shift = parts.includes('shift');
    const alt = parts.includes('alt');
    const targetKey = parts[parts.length - 1];

    // Check if all modifiers match
    const ctrlMatch = ctrl === event.ctrlKey;
    const metaMatch = meta === event.metaKey;
    const shiftMatch = shift === event.shiftKey;
    const altMatch = alt === event.altKey;
    const keyMatch = targetKey === event.key.toLowerCase();

    if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
      event.preventDefault();
      event.stopPropagation();
      callback(event);
    }
  }, [key, callback, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown, enabled]);
};
