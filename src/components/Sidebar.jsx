import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  FileText, 
  Folder, 
  Settings, 
  X 
} from 'lucide-react';

/**
 * Sidebar navigation component
 * Links: 💬 Chat, 📝 Notes, 📁 Explorer, ⚙️ Settings
 * Show active tab with highlighting
 * Responsive (collapsible on mobile)
 */
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Chat',
      path: '/chat',
      icon: MessageCircle,
      description: 'WhatsApp-style chat interface'
    },
    {
      name: 'Notes',
      path: '/notes',
      icon: FileText,
      description: 'Markdown notes editor'
    },
    {
      name: 'Explorer',
      path: '/explorer',
      icon: Folder,
      description: 'File management system'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      description: 'App configuration'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text_primary">SelfDesk</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface2 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-text_secondary" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text_secondary hover:bg-surface2 hover:text-text_primary'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              SelfDesk v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:flex lg:flex-col">
        <div className="flex flex-col h-full bg-surface border-r border-border">
          {/* Desktop Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-text_primary">SelfDesk</h2>
            <p className="text-sm text-text-secondary mt-1">Your Personal Workspace</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive(item.path)
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text_secondary hover:bg-surface2 hover:text-text_primary'
                    }
                  `}
                >
                  <Icon className={`
                    h-5 w-5 transition-colors
                    ${isActive(item.path) ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                  {isActive(item.path) && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              SelfDesk v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
