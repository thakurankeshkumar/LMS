'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Navbar({ role }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchAccount = async () => {
      try {
        const response = await fetch('/api/account');
        if (!response.ok) return;
        const data = await response.json();
        if (mounted) setAccount(data.user);
      } catch {
        // The navbar should never crash a page if account status cannot be loaded.
      }
    };

    fetchAccount();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'GET' });
    await signOut({ redirect: false });
    router.push('/');
  };

  const links = {
    student: [
      ['Dashboard', '/dashboards/student'],
      ['Tests', '/dashboards/student/tests'],
      ['Results', '/dashboards/student/results'],
      ['History', '/dashboards/student/history'],
      ['Account', '/dashboards/student/account'],
    ],
    teacher: [
      ['Dashboard', '/dashboards/teacher'],
      ['My Tests', '/dashboards/teacher/tests'],
      ['Create', '/dashboards/teacher/create-test'],
      ['Submissions', '/dashboards/teacher/submissions'],
      ['Account', '/dashboards/teacher/account'],
    ],
    admin: [
      ['Dashboard', '/dashboards/admin'],
      ['Users', '/dashboards/admin/users'],
      ['Submissions', '/dashboards/admin/submissions'],
      ['Settings', '/dashboards/admin/settings'],
    ],
  };

  const navLinks = links[role] || [];

  return (
    <>
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/88 shadow-lg shadow-black/20 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-slate-100">
            <span className="flex size-10 items-center justify-center rounded-md bg-sky-400 text-sm font-black text-slate-950 shadow-sm">
              LMS
            </span>
            <span className="hidden text-sm font-semibold text-slate-400 sm:block">
              Learning Operations
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-ring"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold capitalize text-slate-300 sm:inline-flex">
              {role}
            </span>
            <button
              onClick={handleLogout}
              className="hidden min-h-10 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-white focus-ring sm:inline-flex"
            >
              Logout
            </button>
            <button
              onClick={() => setOpen((value) => !value)}
              className="flex size-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-100 focus-ring lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              {open ? 'x' : '='}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-slate-800 py-3 lg:hidden">
            <div className="grid gap-1">
              {navLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 focus-ring"
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="mt-2 rounded-md bg-slate-100 px-3 py-3 text-left text-sm font-semibold text-slate-100 focus-ring sm:hidden"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
    {account && !account.isActive && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur">
        <div className="w-full max-w-lg rounded-lg border border-rose-400/30 bg-slate-950 p-6 text-center shadow-2xl shadow-black/50">
          <p className="text-sm font-bold uppercase tracking-wide text-rose-300">Account blocked</p>
          <h2 className="mt-3 text-3xl font-black text-white">Your LMS access is blocked</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            You cannot take tests, create tests, review submissions, or perform account operations until an administrator unblocks your account.
          </p>
          <button
            onClick={handleLogout}
            className="mt-6 rounded-md bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-white focus-ring"
          >
            Logout
          </button>
        </div>
      </div>
    )}
    </>
  );
}
