import { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';

// Create the theme context
const ThemeContext = createContext(null);

// Custom hook to use theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const themeState = useTheme();
  
  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
