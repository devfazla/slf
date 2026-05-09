import React from 'react';
import Layout from '../components/Layout';
import { Folder } from 'lucide-react';
import FileExplorer from '../components/FileExplorer';

const Explorer = () => {
  return (
    <Layout title="Explorer" icon={Folder}>
      <div className="flex flex-col h-full min-h-0 p-6">
        <FileExplorer />
      </div>
    </Layout>
  );
};

export default Explorer;
