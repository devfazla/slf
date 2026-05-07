import Layout from '../components/Layout'
import { Folder } from 'lucide-react'

const Explorer = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-96 bg-surface rounded-lg p-8">
        <Folder className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-text_primary mb-2">File Explorer</h1>
        <p className="text-text_secondary text-center">
          File explorer will be implemented in Step 8
        </p>
        <p className="text-text_tertiary text-sm mt-2">
          Folder-based file management with Telegram storage
        </p>
      </div>
    </Layout>
  )
}

export default Explorer
