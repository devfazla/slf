/**
 * Local storage utilities for SelfDesk
 * Handles theme preferences, user sessions, and app settings
 */

// Theme preference management
export const setThemePreference = (themeName) => {
  try {
    localStorage.setItem('selfdesk_theme', themeName);
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
};

export const getThemePreference = () => {
  try {
    return localStorage.getItem('selfdesk_theme');
  } catch (error) {
    console.warn('Failed to get theme preference:', error);
    return null;
  }
};

// User session management
export const setUserSession = (sessionData) => {
  try {
    localStorage.setItem('selfdesk_session', JSON.stringify(sessionData));
  } catch (error) {
    console.warn('Failed to save user session:', error);
  }
};

export const getUserSession = () => {
  try {
    const session = localStorage.getItem('selfdesk_session');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.warn('Failed to get user session:', error);
    return null;
  }
};

export const clearUserSession = () => {
  try {
    localStorage.removeItem('selfdesk_session');
  } catch (error) {
    console.warn('Failed to clear user session:', error);
  }
};

// App settings management
export const setAppSetting = (key, value) => {
  try {
    const settings = getAppSettings();
    settings[key] = value;
    localStorage.setItem('selfdesk_settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save app setting:', error);
  }
};

export const getAppSetting = (key) => {
  try {
    const settings = getAppSettings();
    return settings[key];
  } catch (error) {
    console.warn('Failed to get app setting:', error);
    return null;
  }
};

export const getAppSettings = () => {
  try {
    const settings = localStorage.getItem('selfdesk_settings');
    return settings ? JSON.parse(settings) : {};
  } catch (error) {
    console.warn('Failed to get app settings:', error);
    return {};
  }
};

// Utility functions
export const clearAllStorage = () => {
  try {
    localStorage.removeItem('selfdesk_theme');
    localStorage.removeItem('selfdesk_session');
    localStorage.removeItem('selfdesk_settings');
  } catch (error) {
    console.warn('Failed to clear storage:', error);
  }
};

export const getStorageUsage = () => {
  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    return {
      used: totalSize,
      usedFormatted: `${(totalSize / 1024).toFixed(2)} KB`,
      available: '5 MB', // Typical localStorage limit
      percentage: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)
    };
  } catch (error) {
    console.warn('Failed to get storage usage:', error);
    return null;
  }
};
