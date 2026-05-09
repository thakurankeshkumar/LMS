'use client';

import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';

export function useToast() {
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  const Toast = () => {
    if (!toast) return null;

    const types = {
      success: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-100',
      error: 'border-rose-400/30 bg-rose-400/12 text-rose-100',
      warning: 'border-amber-400/30 bg-amber-400/12 text-amber-100',
      info: 'border-sky-400/30 bg-sky-400/12 text-sky-100',
    };

    return (
      <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className={`rounded-lg border px-4 py-3 text-sm shadow-xl ${types[toast.type] || types.info}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{toast.message}</p>
            <button onClick={() => setToast(null)} className="rounded px-2 font-bold opacity-70 hover:opacity-100 focus-ring" aria-label="Dismiss notification">
              x
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { notify, Toast };
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState(null);

  const confirm = ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger' }) =>
    new Promise((resolve) => {
      setDialog({ title, message, confirmLabel, cancelLabel, variant, resolve });
    });

  const close = (value) => {
    if (dialog?.resolve) dialog.resolve(value);
    setDialog(null);
  };

  const ConfirmDialog = () => (
    <Modal
      isOpen={Boolean(dialog)}
      onClose={() => close(false)}
      title={dialog?.title || 'Confirm action'}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => close(false)}>
            {dialog?.cancelLabel || 'Cancel'}
          </Button>
          <Button variant={dialog?.variant || 'danger'} onClick={() => close(true)}>
            {dialog?.confirmLabel || 'Confirm'}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-400">{dialog?.message}</p>
    </Modal>
  );

  return { confirm, ConfirmDialog };
}
