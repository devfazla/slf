import Layout from '../components/Layout'
import { Settings } from 'lucide-react'

const SettingsPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-96 bg-surface rounded-lg p-8">
        <Settings className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-text_primary mb-2">Settings</h1>
        <p className="text-text_secondary text-center">
          Settings page will be implemented in Step 9
        </p>
        <p className="text-text_tertiary text-sm mt-2">
          Password management, theme customization, and app configuration
        </p>
      </div>
    </Layout>
  )
}

export default SettingsPage
