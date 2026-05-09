'use client';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center app-surface">
      <div className="text-center">
        <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-slate-800 border-t-sky-400" />
        <p className="text-sm font-semibold text-slate-300">Loading...</p>
      </div>
    </div>
  );
}
