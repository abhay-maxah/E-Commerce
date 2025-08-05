import { Trash2, X, AlertTriangle } from "lucide-react";

const ConfirmDeletePopup = ({
  open,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  subtitle = "This will remove all associated data permanently.",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-[#A31621] focus:outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 text-[#A31621] p-2 rounded-full">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#A31621]">{title}</h2>
        </div>

        {/* Message */}
        <p className="text-sm text-neutral-700 mb-2">{message}</p>

        {/* Subtitle / note */}
        {subtitle && (
          <p className="text-xs text-neutral-500 mb-6 italic">{subtitle}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-[#A31621] hover:bg-[#88121a] rounded-lg flex items-center gap-2 transition focus:outline-none"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletePopup;
