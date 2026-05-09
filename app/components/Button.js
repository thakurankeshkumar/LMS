'use client';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
