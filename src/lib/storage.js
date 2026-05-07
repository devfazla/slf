// localStorage helpers for session management and theme preferences

/**
 * Store session token in localStorage
 * @param {string} token - Session token
 */
export function setSession(token) {
  localStorage.setItem('selfdesk_session', token);
}

/**
 * Get session token from localStorage
 * @returns {string|null} - Session token or null if not found
 */
export function getSession() {
  return localStorage.getItem('selfdesk_session');
}

/**
 * Clear session token from localStorage
 */
export function clearSession() {
  localStorage.removeItem('selfdesk_session');
}

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
 * Get user ID from localStorage
 * @returns {string|null} - User ID or null if not found
 */
export function getUserId() {
  return localStorage.getItem('selfdesk_user_id');
}

/**
 * Store user ID in localStorage
 * @param {string} userId - User ID
 */
export function setUserId(userId) {
  localStorage.setItem('selfdesk_user_id', userId);
}

/**
 * Clear user ID from localStorage
 */
export function clearUserId() {
  localStorage.removeItem('selfdesk_user_id');
}

/**
 * Clear all SelfDesk data from localStorage
 */
export function clearAllData() {
  localStorage.removeItem('selfdesk_session');
  localStorage.removeItem('selfdesk_theme');
  localStorage.removeItem('selfdesk_theme_mode');
  localStorage.removeItem('selfdesk_user_id');
}
