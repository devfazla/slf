import React, { useState } from 'react';
import Layout from '../components/Layout';
import ChatUI from '../components/ChatUI';
import { MessageCircle, RefreshCw } from 'lucide-react';

const Chat = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastSynced, setLastSynced] = useState(null);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout fullHeight>
      <div className="flex flex-col h-full min-h-0">
        {/* Chat Header */}
        <div className="bg-surface border-b border-border px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-text_primary">Chat</h1>
            </div>

            <div className="flex items-center space-x-3">
              {lastSynced && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface2/30 rounded-full border border-border/40">
                  <div className={`h-2 w-2 rounded-full ${isPolling ? 'bg-primary animate-pulse' : 'bg-success'}`} />
                  <span className="text-xs text-text_secondary font-medium">
                    {isPolling ? 'Syncing...' : `Synced ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                </div>
              )}

              <button 
                onClick={handleRefresh}
                disabled={isPolling}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isPolling 
                    ? 'text-primary bg-primary/10' 
                    : 'text-text_secondary hover:bg-surface2 hover:text-primary'
                }`}
                title="Sync messages"
              >
                <RefreshCw className={`h-5 w-5 ${isPolling ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatUI 
            onPollingChange={setIsPolling} 
            onSyncComplete={setLastSynced}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
