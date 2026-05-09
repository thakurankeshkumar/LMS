'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import { PageHeader, QuickLink, StatCard } from '@/app/components/DashboardUI';

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role !== 'teacher') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const testsRes = await fetch('/api/tests');
        const submissionsRes = await fetch('/api/submissions');

        const testsData = await testsRes.json();
        const submissionsData = await submissionsRes.json();

        const pendingApproval = submissionsData.submissions.filter((s) => !s.isApproved).length;
        const approved = submissionsData.submissions.filter((s) => s.isApproved).length;

        setStats({
          totalTests: testsData.tests.length,
          totalSubmissions: submissionsData.submissions.length,
          pendingApproval,
          approved,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  if (!session || session.user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="teacher" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow="Teacher workspace"
          title={`Welcome, ${session.user.name}!`}
          description="Create tests, assign cohorts, publish assessments, and clear pending submissions from one place."
        />

        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="My Tests" value={stats.totalTests} tone="blue" />
            <StatCard label="Total Submissions" value={stats.totalSubmissions} tone="green" />
            <StatCard label="Pending Approval" value={stats.pendingApproval} tone={stats.pendingApproval ? 'amber' : 'slate'} />
            <StatCard label="Approved" value={stats.approved} tone="teal" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-100">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <QuickLink href="/dashboards/teacher/tests" title="My Tests" description="Manage drafts, publishing, assignment, and editing." />
              <QuickLink href="/dashboards/teacher/create-test" title="Create Test" description="Build MCQ assessments with duration, marks, and feedback." />
              <QuickLink href="/dashboards/teacher/submissions" title="Submissions" description="Review attempts, add remarks, and approve results." />
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-100">Review Queue</h2>
            <p className="text-sm leading-6 text-slate-400">
              Keep pending approvals low so students get timely result visibility. Use the submissions page to triage by score, test, and approval status.
            </p>
            <div className="mt-5 rounded-lg bg-slate-950/55 p-4">
              <p className="text-sm font-semibold text-slate-500">Pending workload</p>
              <p className="mt-2 text-3xl font-black text-slate-100">{stats?.pendingApproval ?? 0}</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
