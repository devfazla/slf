import { FileText } from 'lucide-react'

const Notes = () => {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-96">
          <FileText className="h-16 w-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-text_primary mb-2">Notes</h1>
          <p className="text-text_secondary text-center">
            Notes editor will be implemented in Step 7
          </p>
          <p className="text-text_tertiary text-sm mt-2">
            Markdown notes editor with Supabase integration
          </p>
        </div>
      </div>
    </div>
  )
}

export default Notes
