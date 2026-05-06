import { Folder } from 'lucide-react'

const Explorer = () => {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-96">
          <Folder className="h-16 w-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-text_primary mb-2">File Explorer</h1>
          <p className="text-text_secondary text-center">
            File explorer will be implemented in Step 8
          </p>
          <p className="text-text_tertiary text-sm mt-2">
            Folder-based file management with Telegram storage
          </p>
        </div>
      </div>
    </div>
  )
}

export default Explorer
