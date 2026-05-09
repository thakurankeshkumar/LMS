'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Card from './Card';
import Loading from './Loading';
import { Badge, PageHeader, StatCard } from './DashboardUI';

export default function AccountPage({ role }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role !== role) {
      router.push('/');
    }
  }, [session, status, role, router]);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch('/api/account');
        const data = await response.json();
        if (response.ok) setAccount(data.user);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchAccount();
  }, [session]);

  if (status === 'loading' || loading) return <Loading />;
  if (!session || session.user?.role !== role) return null;

  return (
    <div className="min-h-screen app-surface">
      <Navbar role={role} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow={`${role} account`}
          title="Account"
          description="Review your profile, role, and access status."
        />

        {account && (
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-400">Profile</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{account.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{account.email}</p>
                </div>
                <Badge tone={account.isActive ? 'green' : 'red'}>{account.isActive ? 'Active' : 'Blocked'}</Badge>
              </div>

              {!account.isActive && (
                <div className="mt-5 rounded-lg border border-rose-400/30 bg-rose-400/12 p-4 text-sm leading-6 text-rose-100">
                  Your account is blocked. You cannot perform LMS operations until an administrator unblocks you.
                </div>
              )}
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Role" value={account.role} tone="blue" />
              <StatCard label="Status" value={account.isActive ? 'Active' : 'Blocked'} tone={account.isActive ? 'green' : 'red'} />
              <StatCard label="Joined" value={new Date(account.createdAt).toLocaleDateString()} tone="slate" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
