import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Reusable confirmation modal for destructive actions.
 * Shows a centered modal with backdrop overlay.
 */
const DeleteConfirmModal = ({
  isOpen,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative bg-surface border border-border rounded-xl shadow-lg max-w-md w-full p-6 animate-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-text_tertiary hover:text-text_primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Warning icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-danger/10 rounded-full mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-danger" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text_primary text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-text_secondary text-center mb-6">
          {message}
        </p>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface2 text-text_primary font-medium text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-danger hover:bg-danger/90 text-white font-medium text-sm transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
