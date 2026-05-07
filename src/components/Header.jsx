import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth';
import { Menu, LogOut, Palette } from 'lucide-react';

/**
 * Top header bar component
 * Display app title "SelfDesk"
 * Show current theme name
 * Quick theme toggle button (optional)
 * Show logout button
 */
const Header = ({ onMenuClick }) => {
  const { currentTheme, getThemeDisplayName, setTheme, getAvailableThemes } = useThemeContext();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    const themes = getAvailableThemes();
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <header className="bg-surface border-b border-border px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu and Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-surface2 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-text_secondary" />
          </button>

          {/* App Title */}
          <div>
            <h1 className="text-xl font-bold text-text_primary">SelfDesk</h1>
            <p className="text-sm text-text-secondary hidden sm:block">Your Personal Workspace</p>
          </div>
        </div>

        {/* Right Section - Theme and Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-surface2 rounded-lg">
            <Palette className="h-4 w-4 text-text-secondary" />
            <span className="text-sm font-medium text-text_primary">
              {getThemeDisplayName(currentTheme)}
            </span>
          </div>

          {/* Quick Theme Toggle (Desktop) */}
          <button
            onClick={handleThemeToggle}
            className="hidden md:flex items-center space-x-2 px-3 py-2 bg-surface2 rounded-lg hover:bg-surface transition-colors"
            title="Switch theme"
          >
            <Palette className="h-4 w-4 text-text-secondary" />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Theme Info */}
      <div className="flex md:hidden items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-text-secondary" />
          <span className="text-sm text-text_secondary">
            Theme: {getThemeDisplayName(currentTheme)}
          </span>
        </div>
        <button
          onClick={handleThemeToggle}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Change Theme
        </button>
      </div>
    </header>
  );
};

export default Header;
