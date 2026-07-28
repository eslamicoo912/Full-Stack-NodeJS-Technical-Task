import Modal from './Modal';

// Simple yes/no confirmation used before destructive actions
function ConfirmDialog({
  title,
  message,
  isLoading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
