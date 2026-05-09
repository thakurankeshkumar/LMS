'use client';

export default function Card({ children, className = '' }) {
  return (
    <section className={`rounded-lg border border-slate-800/80 bg-slate-900/78 p-5 shadow-xl shadow-black/15 backdrop-blur ${className}`}>
      {children}
    </section>
  );
}
