'use client';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  title,
}) {
  const baseStyles = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-55';

  const variants = {
    primary: 'bg-sky-500 text-slate-950 shadow-sm hover:bg-sky-400',
    secondary: 'border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800',
    ghost: 'text-slate-200 hover:bg-slate-800',
    danger: 'bg-rose-500 text-white shadow-sm hover:bg-rose-400',
    success: 'bg-emerald-500 text-slate-950 shadow-sm hover:bg-emerald-400',
    warning: 'bg-amber-400 text-slate-950 shadow-sm hover:bg-amber-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
