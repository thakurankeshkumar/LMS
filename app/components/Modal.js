'use client';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={`max-h-[92vh] w-full ${sizes[size] || sizes.md} overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50`}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus-ring"
            aria-label="Close dialog"
          >
            x
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-slate-800 bg-slate-950/60 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
