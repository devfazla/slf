import { COLOR_KEYS } from '../config/themeConfig';

/**
 * Apply theme colors to CSS variables on the document root
 * @param {Object} colors - Theme color object
 */
export const applyTheme = (colors) => {
  if (!colors || typeof colors !== 'object') {
    console.error('Invalid colors object provided to applyTheme');
    return;
  }

  const root = document.documentElement;
  
  // Apply all color variables
  COLOR_KEYS.forEach(key => {
    const value = colors[key];
    if (value) {
      root.style.setProperty(`--color-${key}`, value);
    }
  });

  // Set data-theme attribute for CSS targeting
  const themeName = getThemeName(colors);
  if (themeName) {
    root.setAttribute('data-theme', themeName);
  }

  // Apply meta theme-color for mobile browsers
  updateMetaThemeColor(colors);
};

/**
 * Get theme name from colors object (reverse lookup)
 * @param {Object} colors - Theme color object
 * @returns {string} Theme name or 'custom'
 */
const getThemeName = (colors) => {
  // This is a simplified check - in a real app, you might want to store the theme name separately
  // or do a more sophisticated comparison
  const { THEME_PRESETS } = require('../config/themeConfig');
  
  for (const [name, presetColors] of Object.entries(THEME_PRESETS)) {
    if (colorsMatch(colors, presetColors)) {
      return name;
    }
  }
  
  return 'custom';
};

/**
 * Check if two color objects match
 * @param {Object} colors1 - First color object
 * @param {Object} colors2 - Second color object
 * @returns {boolean} Whether colors match
 */
const colorsMatch = (colors1, colors2) => {
  if (!colors1 || !colors2) return false;
  
  return COLOR_KEYS.every(key => {
    return colors1[key] === colors2[key];
  });
};

/**
 * Update meta theme-color for mobile browsers
 * @param {Object} colors - Theme color object
 */
const updateMetaThemeColor = (colors) => {
  let themeColor = colors.background || '#ffffff';
  
  // For dark themes, use a darker color
  if (colors.background && isDarkColor(colors.background)) {
    themeColor = colors.surface || colors.background;
  }
  
  // Update or create meta tag
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.content = themeColor;
};

/**
 * Check if a color is dark
 * @param {string} color - Hex color
 * @returns {boolean} Whether color is dark
 */
const isDarkColor = (color) => {
  if (!color || !color.startsWith('#')) return false;
  
  // Remove # and convert to RGB
  const hex = color.slice(1);
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance (simplified)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

/**
 * Get current CSS variable value
 * @param {string} key - Color key (e.g., 'primary')
 * @returns {string} Current CSS variable value
 */
export const getCurrentColor = (key) => {
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(`--color-${key}`).trim();
};

/**
 * Get all current theme colors
 * @returns {Object} All current CSS variable values
 */
export const getCurrentTheme = () => {
  const colors = {};
  COLOR_KEYS.forEach(key => {
    colors[key] = getCurrentColor(key);
  });
  return colors;
};

/**
 * Reset theme to default (light) colors
 */
export const resetTheme = () => {
  const { THEME_PRESETS } = require('../config/themeConfig');
  applyTheme(THEME_PRESETS.light);
};

/**
 * Apply theme with transition effect
 * @param {Object} colors - Theme color object
 * @param {number} duration - Transition duration in ms
 */
export const applyThemeWithTransition = (colors, duration = 300) => {
  const root = document.documentElement;
  
  // Add transition class
  root.style.setProperty('--theme-transition-duration', `${duration}ms`);
  root.classList.add('theme-transitioning');
  
  // Apply theme
  applyTheme(colors);
  
  // Remove transition class after animation
  setTimeout(() => {
    root.classList.remove('theme-transitioning');
    root.style.removeProperty('--theme-transition-duration');
  }, duration);
};
