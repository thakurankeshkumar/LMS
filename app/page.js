import Link from 'next/link';

export default function Home() {
  const roleCards = [
    ['Students', 'Take assigned tests, track pending attempts, and review approved results without hunting through menus.'],
    ['Teachers', 'Create assessments, assign learners, publish tests, and approve submissions with clear review queues.'],
    ['Admins', 'Monitor platform health, manage users, inspect submissions, and keep assessment operations moving.'],
  ];

  const capabilities = [
    'Timed MCQ assessments',
    'Teacher approval workflow',
    'Role-based dashboards',
    'Submission history',
    'Published and draft tests',
    'System analytics',
    'Responsive on every device',
    'Custom dialogs and notifications',
  ];

  return (
    <main className="min-h-screen app-surface text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-sky-400 text-sm font-black text-slate-950">LMS</span>
            <span className="font-bold">Learning Management</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white focus-ring">
              Login
            </Link>
            <Link href="/auth/register" className="rounded-md bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-300 focus-ring">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-sky-300">Assessment operations, rebuilt</p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white text-balance sm:text-6xl">
            Learning Management System
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A dark, focused LMS for tests, submissions, approvals, analytics, and user management. Every role gets a clean workflow that works on desktop, tablet, and mobile.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/login" className="rounded-md bg-sky-400 px-6 py-3 text-center text-sm font-black text-slate-950 hover:bg-sky-300 focus-ring">
              Open dashboard
            </Link>
            <Link href="/auth/register" className="rounded-md border border-slate-700 bg-slate-900 px-6 py-3 text-center text-sm font-bold text-slate-100 hover:bg-slate-800 focus-ring">
              Create student account
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ['3', 'role portals'],
              ['24/7', 'test access'],
              ['100%', 'responsive'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 shadow-2xl shadow-black/40">
          <div className="rounded-md border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-sm text-slate-400">Live operations</p>
                <p className="text-xl font-bold text-white">Admin command view</p>
              </div>
              <span className="rounded-full bg-emerald-400/12 px-3 py-1 text-xs font-bold text-emerald-200">Healthy</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ['132', 'Active learners'],
                ['18', 'Published tests'],
                ['07', 'Pending reviews'],
                ['91%', 'Approval rate'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-md border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold text-white">Review queue</p>
                <p className="text-xs font-bold text-amber-200">Needs action</p>
              </div>
              {['Physics mock test', 'JavaScript basics', 'Database fundamentals'].map((test, index) => (
                <div key={test} className="flex items-center justify-between border-t border-slate-800 py-3 first:border-t-0 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{test}</p>
                    <p className="text-xs text-slate-500">{[12, 9, 4][index]} submissions</p>
                  </div>
                  <span className="rounded-full bg-sky-400/12 px-2.5 py-1 text-xs font-bold text-sky-200">Review</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {roleCards.map(([title, description]) => (
            <div key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-xl font-bold text-white">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-2xl font-black text-white">Built for real LMS flow</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              From the first assigned test to the final approved score, the interface keeps users inside a clear operational rhythm instead of scattering actions across disconnected screens.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div key={item} className="rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm font-semibold text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
