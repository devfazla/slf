import React, { useEffect } from 'react';
import { ThemeProvider as ThemeContextProvider } from '../context/ThemeContext.jsx';
import { applyThemeWithTransition } from '../lib/applyTheme';

/**
 * ThemeProvider component that wraps the entire application
 * Handles theme initialization and provides theme context to all children
 */
const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Add theme transition styles to head
    const style = document.createElement('style');
    style.textContent = `
      .theme-transitioning *,
      .theme-transitioning *::before,
      .theme-transitioning *::after {
        transition: background-color var(--theme-transition-duration, 300ms) ease-in-out,
                    border-color var(--theme-transition-duration, 300ms) ease-in-out,
                    color var(--theme-transition-duration, 300ms) ease-in-out !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup styles on unmount
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <ThemeContextProvider>
      {children}
    </ThemeContextProvider>
  );
};

export default ThemeProvider;
