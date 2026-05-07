import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { THEME_PRESETS, COLOR_KEYS } from '../config/themeConfig';
import { applyTheme } from '../lib/applyTheme';
import { getUserId } from '../lib/storage';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [colors, setColors] = useState(THEME_PRESETS.light);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load theme from Supabase on mount
  const loadThemeFromSupabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = getUserId();
      if (!userId) {
        // If no user ID, use system preference or default to light
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setCurrentTheme(systemTheme);
        setColors(THEME_PRESETS[systemTheme]);
        applyTheme(THEME_PRESETS[systemTheme]);
        return;
      }

      const { data, error } = await supabase
        .from('app_settings')
        .select('current_theme, theme_colors')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let themeToUse = 'light';
      let colorsToUse = THEME_PRESETS.light;

      if (data) {
        themeToUse = data.current_theme || 'light';
        colorsToUse = data.theme_colors || THEME_PRESETS[themeToUse];
      } else {
        // Use system preference if no saved theme
        themeToUse = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        colorsToUse = THEME_PRESETS[themeToUse];
      }

      setCurrentTheme(themeToUse);
      setColors(colorsToUse);
      applyTheme(colorsToUse);
    } catch (err) {
      console.error('Error loading theme:', err);
      setError(err.message);
      // Fallback to light theme
      setCurrentTheme('light');
      setColors(THEME_PRESETS.light);
      applyTheme(THEME_PRESETS.light);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save theme to Supabase
  const saveThemeToSupabase = useCallback(async (themeName, customColors = null) => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const colorsToSave = customColors || THEME_PRESETS[themeName];

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          user_id: userId,
          current_theme: themeName,
          theme_colors: colorsToSave,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving theme:', err);
      setError(err.message);
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
    saveThemeToSupabase(themeName);
  }, [saveThemeToSupabase]);

  // Update custom colors
  const updateColors = useCallback((newColors) => {
    setColors(newColors);
    applyTheme(newColors);
    saveThemeToSupabase(currentTheme, newColors);
  }, [currentTheme, saveThemeToSupabase]);

  // Reset to default theme
  const resetToDefault = useCallback(() => {
    const defaultColors = THEME_PRESETS[currentTheme];
    setColors(defaultColors);
    applyTheme(defaultColors);
    saveThemeToSupabase(currentTheme);
  }, [currentTheme, saveThemeToSupabase]);

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
    loadThemeFromSupabase();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a theme
      const userId = getUserId();
      if (!userId) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [loadThemeFromSupabase, setTheme]);

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
    saveThemeToSupabase,
    loadThemeFromSupabase
  };
};
