'use client';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
