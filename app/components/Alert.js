'use client';

export default function Alert({ type = 'info', message, onClose }) {
  const types = {
    success: 'bg-emerald-500/12 text-emerald-200 border-emerald-500/30',
    error: 'bg-rose-500/12 text-rose-200 border-rose-500/30',
    info: 'bg-sky-500/12 text-sky-200 border-sky-500/30',
    warning: 'bg-amber-400/12 text-amber-100 border-amber-400/30',
  };

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm ${types[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="rounded-md px-2 font-bold opacity-70 hover:opacity-100 focus-ring" aria-label="Dismiss message">
          x
        </button>
      )}
    </div>
  );
}
