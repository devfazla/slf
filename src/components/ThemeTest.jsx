import React from 'react';
import { useThemeContext } from '../context/ThemeContext.jsx';

const ThemeTest = () => {
  const { 
    currentTheme, 
    colors, 
    setTheme, 
    getAvailableThemes, 
    getThemeDisplayName,
    isDarkTheme,
    isLoading,
    error 
  } = useThemeContext();

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-text_secondary">Loading theme...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-danger">Theme error: {error}</p>
      </div>
    );
  }

  const availableThemes = getAvailableThemes();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text_primary">Theme System Test</h2>
        
        <div className="space-y-2">
          <p className="text-text_secondary">
            Current Theme: <span className="font-semibold text-primary">{getThemeDisplayName(currentTheme)}</span>
          </p>
          <p className="text-text_secondary">
            Is Dark: <span className="font-semibold text-accent">{isDarkTheme() ? 'Yes' : 'No'}</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text_primary">Theme Switcher</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => setTheme(theme)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentTheme === theme
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text_primary border-border hover:bg-surface2'
              }`}
            >
              {getThemeDisplayName(theme)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text_primary">Color Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div 
                className="w-full h-12 rounded-lg border border-border"
                style={{ backgroundColor: value }}
              />
              <p className="text-xs text-text_secondary text-center">
                {key}
              </p>
              <p className="text-xs text-text-tertiary text-center font-mono">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text_primary">UI Elements Test</h3>
        <div className="space-y-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80">
            Secondary Button
          </button>
          <button className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80">
            Accent Button
          </button>
          <button className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/80">
            Success Button
          </button>
          <button className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/80">
            Warning Button
          </button>
          <button className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/80">
            Danger Button
          </button>
          <button className="px-4 py-2 bg-info text-white rounded-lg hover:bg-info/80">
            Info Button
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text_primary">Text Colors Test</h3>
        <div className="space-y-2 bg-surface p-4 rounded-lg">
          <p className="text-text_primary">Primary text color</p>
          <p className="text-text_secondary">Secondary text color</p>
          <p className="text-text-tertiary">Tertiary text color</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text_primary">Surface Colors Test</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background p-4 rounded-lg border border-border">
            <p className="text-text_primary text-sm">Background</p>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-border">
            <p className="text-text_primary text-sm">Surface</p>
          </div>
          <div className="bg-surface2 p-4 rounded-lg border border-border">
            <p className="text-text_primary text-sm">Surface 2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
