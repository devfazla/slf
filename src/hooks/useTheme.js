import { useState, useEffect, useCallback } from 'react';
import { THEME_PRESETS, COLOR_KEYS } from '../config/themeConfig';
import { applyTheme } from '../lib/applyTheme';
import { getUserId, setThemePreference, getThemePreference } from '../lib/storage';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [colors, setColors] = useState(THEME_PRESETS.light);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load theme on mount
  const loadTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First check localStorage for saved theme
      const savedTheme = getThemePreference();
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const themeToUse = savedTheme || systemTheme;
      const colorsToUse = THEME_PRESETS[themeToUse] || THEME_PRESETS.light;

      setCurrentTheme(themeToUse);
      setColors(colorsToUse);
      applyTheme(colorsToUse);

      // Try to load from Supabase (non-blocking, won't crash if it fails)
      const userId = getUserId();
      if (userId) {
        try {
          const { supabase } = await import('../lib/supabaseClient');
          const { data } = await supabase
            .from('app_settings')
            .select('current_theme, theme_colors')
            .eq('user_id', userId)
            .single();

          if (data) {
            const supaTheme = data.current_theme || themeToUse;
            const supaColors = data.theme_colors || THEME_PRESETS[supaTheme];
            setCurrentTheme(supaTheme);
            setColors(supaColors);
            applyTheme(supaColors);
          }
        } catch (supabaseErr) {
          // Supabase not available - localStorage theme is already applied, just continue
          console.warn('Supabase theme load skipped:', supabaseErr.message);
        }
      }
    } catch (err) {
      console.error('Error loading theme:', err);
      // Fallback to light theme
      setCurrentTheme('light');
      setColors(THEME_PRESETS.light);
      applyTheme(THEME_PRESETS.light);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save theme (localStorage as primary, Supabase as secondary)
  const saveTheme = useCallback(async (themeName, customColors = null) => {
    // Always save to localStorage first
    setThemePreference(themeName);

    // Try Supabase (non-blocking)
    const userId = getUserId();
    if (userId) {
      try {
        const { supabase } = await import('../lib/supabaseClient');
        const colorsToSave = customColors || THEME_PRESETS[themeName];
        const { error: supabaseError } = await supabase
          .from('app_settings')
          .upsert({
            user_id: userId,
            current_theme: themeName,
            theme_colors: colorsToSave,
            updated_at: new Date().toISOString()
          });
        if (supabaseError) throw supabaseError;
      } catch (err) {
        // Supabase save failed - localStorage is already saved, just continue
        console.warn('Supabase theme save skipped:', err.message);
      }
    }
  }, []);

  // Switch theme
  const setTheme = useCallback((themeName) => {
    if (!THEME_PRESETS[themeName]) {
      console.error(`Theme "${themeName}" not found`);
      return;
    }

    const newColors = THEME_PRESETS[themeName];
    setCurrentTheme(themeName);
    setColors(newColors);
    applyTheme(newColors);
    saveTheme(themeName);
  }, [saveTheme]);

  // Update custom colors
  const updateColors = useCallback((newColors) => {
    setColors(newColors);
    applyTheme(newColors);
    saveTheme(currentTheme, newColors);
  }, [currentTheme, saveTheme]);

  // Reset to default theme
  const resetToDefault = useCallback(() => {
    const defaultColors = THEME_PRESETS[currentTheme];
    setColors(defaultColors);
    applyTheme(defaultColors);
    saveTheme(currentTheme);
  }, [currentTheme, saveTheme]);

  // Get all available themes
  const getAvailableThemes = useCallback(() => {
    return Object.keys(THEME_PRESETS);
  }, []);

  // Get theme display name
  const getThemeDisplayName = useCallback((themeName) => {
    const displayNames = {
      light: 'Light',
      dark: 'Dark',
      sepia: 'Sepia',
      ocean: 'Ocean',
      forest: 'Forest'
    };
    return displayNames[themeName] || themeName;
  }, []);

  // Check if theme is dark
  const isDarkTheme = useCallback((themeName = currentTheme) => {
    return themeName === 'dark';
  }, [currentTheme]);

  // Initialize theme on mount
  useEffect(() => {
    loadTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const userId = getUserId();
      if (!userId) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [loadTheme, setTheme]);

  return {
    currentTheme,
    colors,
    isLoading,
    error,
    setTheme,
    updateColors,
    resetToDefault,
    getAvailableThemes,
    getThemeDisplayName,
    isDarkTheme,
    saveTheme,
    loadTheme
  };
};
