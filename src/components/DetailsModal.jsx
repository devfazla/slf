import React from 'react';
import { X, File, Folder, Calendar, HardDrive, Type, Hash } from 'lucide-react';

const formatBytes = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const DetailsModal = ({ isOpen, onClose, item, type }) => {
  if (!isOpen || !item) return null;

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-3 border-b border-border/50 last:border-0">
      <div className="p-2 bg-surface rounded-lg mr-4 text-text_secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-text_secondary uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        <p className="text-sm text-text_primary font-medium break-all">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <h3 className="text-lg font-bold text-text_primary">Properties</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-background rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-text_secondary" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-8">
            <div className={`p-5 rounded-2xl mb-4 ${type === 'folder' ? 'bg-primary/10' : 'bg-blue-500/10'}`}>
              {type === 'folder' ? (
                <Folder className="h-12 w-12 text-primary" />
              ) : (
                <File className="h-12 w-12 text-blue-500" />
              )}
            </div>
            <h4 className="text-xl font-bold text-text_primary text-center break-all px-4">
              {item.name}
            </h4>
          </div>

          <div className="bg-background/30 rounded-xl border border-border/50 overflow-hidden px-4">
            <DetailRow icon={Type} label="Type" value={type === 'folder' ? 'Folder' : `${item.file_type?.toUpperCase() || 'Unknown'} File`} />
            {type === 'file' && (
              <>
                <DetailRow icon={HardDrive} label="Size" value={formatBytes(item.size_bytes)} />
                <DetailRow icon={Hash} label="MIME Type" value={item.mime_type || 'N/A'} />
              </>
            )}
            <DetailRow icon={Calendar} label="Created" value={new Date(item.created_at).toLocaleString()} />
            {item.id && <DetailRow icon={Hash} label="ID" value={item.id} />}
          </div>
        </div>

        <div className="px-6 py-4 bg-background/50 border-t border-border flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-surface hover:bg-background border border-border rounded-xl text-sm font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
