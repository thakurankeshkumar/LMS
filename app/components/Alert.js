'use client';

export default function Alert({ type = 'info', message, onClose }) {
  const types = {
    success: 'bg-green-900 text-green-200 border-green-700',
    error: 'bg-red-900 text-red-200 border-red-700',
    info: 'bg-blue-900 text-blue-200 border-blue-700',
    warning: 'bg-yellow-900 text-yellow-200 border-yellow-700',
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 flex justify-between items-center ${types[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-lg font-bold">
          ✕
        </button>
      )}
    </div>
  );
}
