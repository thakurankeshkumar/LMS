'use client';

export default function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  required = false,
  disabled = false,
  className = '',
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors ${className}`}
    />
  );
}
