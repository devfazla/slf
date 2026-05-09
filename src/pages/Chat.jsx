import React from 'react';
import Layout from '../components/Layout';
import ChatUI from '../components/ChatUI';
import { MessageCircle } from 'lucide-react';

const Chat = () => {
  return (
    <Layout fullHeight>
      <div className="flex flex-col h-full min-h-0">
        {/* Chat Header */}
        <div className="bg-surface border-b border-border px-6 py-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-text_primary">Chat</h1>
            <span className="text-sm text-text_tertiary">Self-Chat via Telegram</span>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatUI />
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
