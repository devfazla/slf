import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth';
import { Menu, LogOut, Palette } from 'lucide-react';

/**
 * Flexible Top Header Component
 * @param {string} title - Page title
 * @param {React.Component} icon - Lucide icon component
 * @param {React.ReactNode} actions - Custom action buttons for the page
 * @param {function} onMenuClick - Sidebar toggle handler
 * @param {string} height - Custom height class (e.g., 'h-20')
 */
const Header = ({ title, icon: Icon, actions, onMenuClick, height = 'h-16' }) => {
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
    <header className={`bg-surface border-b border-border px-4 lg:px-6 flex items-center flex-shrink-0 lg:ml-64 ${height}`}>
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Menu, Icon and Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-surface2 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-text_secondary" />
          </button>

          {/* Page Icon & Title */}
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="h-6 w-6 text-primary" />}
            <h1 className="text-xl font-semibold text-text_primary">{title || 'SelfDesk'}</h1>
          </div>
        </div>

        {/* Right Section - Custom Actions + Global Actions */}
        <div className="flex items-center space-x-2">
          {/* Custom Page Actions */}
          {actions && (
            <>
              {actions}
              <div className="w-px h-6 bg-border mx-1" />
            </>
          )}
          
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-surface2 border border-border rounded-lg hover:bg-surface transition-colors"
            title="Switch theme"
          >
            <Palette className="h-4 w-4 text-text-secondary" />
            <span className="text-xs font-medium text-text-primary">
              {getThemeDisplayName(currentTheme)}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
