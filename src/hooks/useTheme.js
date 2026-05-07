import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { THEME_PRESETS, COLOR_KEYS } from '../config/themeConfig';
import { applyTheme } from '../lib/applyTheme';
import { setThemePreference, getThemePreference } from '../lib/storage';

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

      // Try to load from Supabase (non-blocking)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data } = await supabase
            .from('app_settings')
            .select('current_theme, theme_colors')
            .eq('user_id', user.id)
            .single();

          if (data) {
            const supaTheme = data.current_theme || themeToUse;
            const supaColors = data.theme_colors || THEME_PRESETS[supaTheme];
            setCurrentTheme(supaTheme);
            setColors(supaColors);
            applyTheme(supaColors);
          }
        } catch (supabaseErr) {
          console.warn('Supabase theme load skipped:', supabaseErr.message);
        }
      }
    } catch (err) {
      console.error('Error loading theme:', err);
      setCurrentTheme('light');
      setColors(THEME_PRESETS.light);
      applyTheme(THEME_PRESETS.light);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save theme (localStorage as primary, Supabase as secondary)
  const saveTheme = useCallback(async (themeName, customColors = null) => {
    setThemePreference(themeName);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        const colorsToSave = customColors || THEME_PRESETS[themeName];
        
        // First try to update existing record
        const { error: updateError } = await supabase
          .from('app_settings')
          .update({
            current_theme: themeName,
            theme_colors: colorsToSave,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        // If no record exists, insert new one
        if (updateError && updateError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('app_settings')
            .insert({
              user_id: user.id,
              current_theme: themeName,
              theme_colors: colorsToSave,
              updated_at: new Date().toISOString()
            });
          if (insertError) throw insertError;
        } else if (updateError) {
          throw updateError;
        }
      } catch (err) {
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

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      setTheme(systemTheme);
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
