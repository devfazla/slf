import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Main layout wrapper for the application
 * Structure:
 * ├── Header
 * ├── Sidebar/Navigation
 * └── Main Content Area
 * Responsive (sidebar collapses on mobile)
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header onMenuClick={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-1 relative">
        {/* Sidebar Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
