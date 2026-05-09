'use client';

import Link from 'next/link';
import Card from './Card';

export function PageShell({ role, children }) {
  return <div className="min-h-screen app-surface">{children}</div>;
}

export function PageHeader({ title, eyebrow, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-300">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{description}</p>}
      </div>
      {action && <div className="flex shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, tone = 'blue', helper }) {
  const tones = {
    blue: 'bg-sky-400',
    green: 'bg-emerald-400',
    amber: 'bg-amber-300',
    red: 'bg-rose-400',
    slate: 'bg-slate-500',
    teal: 'bg-teal-300',
    indigo: 'bg-indigo-300',
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">{value}</p>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>
        <span className={`h-10 w-1.5 rounded-full ${tones[tone] || tones.blue}`} />
      </div>
    </Card>
  );
}

export function QuickLink({ href, title, description }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-800 bg-slate-950/55 p-4 transition-colors hover:border-sky-500/50 hover:bg-slate-900 focus-ring"
    >
      <p className="font-bold text-slate-100">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
    </Link>
  );
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-800 text-slate-200',
    green: 'bg-emerald-400/12 text-emerald-200',
    amber: 'bg-amber-400/12 text-amber-100',
    red: 'bg-rose-400/12 text-rose-200',
    blue: 'bg-sky-400/12 text-sky-200',
    teal: 'bg-teal-400/12 text-teal-200',
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone] || tones.slate}`}>{children}</span>;
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/45 px-6 py-12 text-center">
      <p className="text-lg font-bold text-slate-100">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
