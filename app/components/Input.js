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
  min,
  max,
  step,
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
      min={min}
      max={max}
      step={step}
      className={`w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 shadow-sm transition-colors placeholder:text-slate-500 focus:border-sky-400 focus-ring disabled:bg-slate-900 disabled:text-slate-500 ${className}`}
    />
  );
}
