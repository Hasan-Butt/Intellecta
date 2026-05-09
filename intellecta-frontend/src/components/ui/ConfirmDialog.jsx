import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
              {title || "Are you sure?"}
            </h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {message || "This action cannot be undone."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;