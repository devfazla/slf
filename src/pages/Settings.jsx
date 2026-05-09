import React from 'react';
import Layout from '../components/Layout';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <Layout title="Settings" icon={Settings}>
      <div className="flex flex-col h-full min-h-0">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-96 bg-surface rounded-lg p-8 border border-border shadow-sm">
            <Settings className="h-16 w-16 text-primary mb-4 opacity-50" />
            <h1 className="text-2xl font-bold text-text_primary mb-2">Settings</h1>
            <p className="text-text_secondary text-center max-w-md">
              Settings page will be implemented in Step 9. This will include password management, theme customization, and app configuration.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
