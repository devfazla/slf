import { MessageCircle } from 'lucide-react'

const Chat = () => {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-96">
          <MessageCircle className="h-16 w-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-text_primary mb-2">Chat</h1>
          <p className="text-text_secondary text-center">
            Chat interface will be implemented in Step 6
          </p>
          <p className="text-text_tertiary text-sm mt-2">
            WhatsApp-style chat with Telegram integration
          </p>
        </div>
      </div>
    </div>
  )
}

export default Chat
