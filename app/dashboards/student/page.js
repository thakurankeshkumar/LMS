'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import { EmptyState, PageHeader, QuickLink, StatCard } from '@/app/components/DashboardUI';

export default function StudentDashboard() {
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

    if (session?.user?.role !== 'student') {
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

        const completedTests = submissionsData.submissions.length;
        const pendingTests = testsData.tests.length - completedTests;

        setStats({
          assignedTests: testsData.tests.length,
          completedTests,
          pendingTests,
          approvedResults: submissionsData.submissions.filter((s) => s.isApproved).length,
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

  if (!session || session.user?.role !== 'student') {
    return null;
  }

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="student" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow="Student workspace"
          title={`Welcome, ${session.user.name}!`}
          description="See assigned tests, complete pending work, and review approved results from one responsive dashboard."
        />

        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Assigned Tests" value={stats.assignedTests} tone="blue" />
            <StatCard label="Completed" value={stats.completedTests} tone="green" />
            <StatCard label="Pending" value={Math.max(stats.pendingTests, 0)} tone="amber" />
            <StatCard label="Approved Results" value={stats.approvedResults} tone="indigo" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-100">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <QuickLink href="/dashboards/student/tests" title="Take Tests" description="Start assigned tests and continue your learning work." />
              <QuickLink href="/dashboards/student/results" title="View Results" description="Check approved results, score, remarks, and status." />
              <QuickLink href="/dashboards/student/history" title="Test History" description="Review past submissions and completion records." />
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-100">Progress Focus</h2>
            {stats?.assignedTests ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm font-semibold text-slate-400">
                    <span>Completion</span>
                    <span>{Math.round((stats.completedTests / Math.max(stats.assignedTests, 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-sky-400"
                      style={{ width: `${Math.min(100, Math.round((stats.completedTests / Math.max(stats.assignedTests, 1)) * 100))}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-400">
                  Finish pending assessments first. Approved results are published after review, so your latest attempt may appear in history before results.
                </p>
              </div>
            ) : (
              <EmptyState title="No assigned tests yet" description="When a teacher assigns a published test, it will appear in your test queue." />
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
