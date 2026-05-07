// localStorage helpers for theme preferences
// Note: Session/auth is now handled entirely by Supabase auth (supabase.auth.*)

/**
 * Store theme preference in localStorage
 * @param {string} theme - Theme name
 */
export function setThemePreference(theme) {
  localStorage.setItem('selfdesk_theme', theme);
}

/**
 * Get theme preference from localStorage
 * @returns {string|null} - Theme name or null if not found
 */
export function getThemePreference() {
  return localStorage.getItem('selfdesk_theme');
}

/**
 * Store theme mode preference (light/dark/auto)
 * @param {string} mode - Theme mode
 */
export function setThemeMode(mode) {
  localStorage.setItem('selfdesk_theme_mode', mode);
}

/**
 * Get theme mode preference from localStorage
 * @returns {string|null} - Theme mode or null if not found
 */
export function getThemeMode() {
  return localStorage.getItem('selfdesk_theme_mode');
}

/**
 * Clear all SelfDesk data from localStorage
 */
export function clearAllData() {
  localStorage.removeItem('selfdesk_theme');
  localStorage.removeItem('selfdesk_theme_mode');
}
