import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 justify-center btn-danger">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />Deleting...</>
            ) : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
