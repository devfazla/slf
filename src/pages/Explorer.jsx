import React from 'react';
import Layout from '../components/Layout';
import { Folder } from 'lucide-react';

const Explorer = () => {
  return (
    <Layout title="Explorer" icon={Folder}>
      <div className="flex flex-col h-full min-h-0">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-96 bg-surface rounded-lg p-8 border border-border shadow-sm">
            <Folder className="h-16 w-16 text-primary mb-4 opacity-50" />
            <h1 className="text-2xl font-bold text-text_primary mb-2">File Explorer</h1>
            <p className="text-text_secondary text-center max-w-md">
              File explorer will be implemented in Step 8. This will feature folder-based file management with Telegram storage.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Explorer;
