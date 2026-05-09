'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import { Badge, PageHeader, StatCard } from '@/app/components/DashboardUI';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/results/analytics');
        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchAnalytics();
  }, [session]);

  if (status === 'loading' || loading) return <Loading />;
  if (!session || session.user?.role !== 'admin') return null;

  const pending = analytics?.submissions?.pending || 0;
  const stale = analytics?.submissions?.stalePendingOver7Days || 0;
  const inactive = analytics?.activity?.inactiveUsers || 0;
  const healthTone = stale > 0 ? 'red' : pending > 0 || inactive > 0 ? 'amber' : 'green';
  const healthLabel = stale > 0 ? 'Needs attention' : pending > 0 || inactive > 0 ? 'Review queue active' : 'System healthy';

  const actions = [
    ['Manage Users', 'Create and remove accounts', '/dashboards/admin/users', 'blue'],
    ['All Submissions', 'Inspect review status', '/dashboards/admin/submissions', 'amber'],
    ['Settings', 'Configure registration', '/dashboards/admin/settings', 'teal'],
  ];

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="admin" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow="Admin command center"
          title="Admin Dashboard"
          description="A clean control room for platform health, people, tests, and review workload."
        />

        {analytics && (
          <div className="space-y-6">
            <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="overflow-hidden p-0">
                <div className="border-b border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-400">Platform status</p>
                      <h2 className="mt-1 text-3xl font-black text-white">{healthLabel}</h2>
                    </div>
                    <Badge tone={healthTone}>{analytics.alerts.length} active signal{analytics.alerts.length === 1 ? '' : 's'}</Badge>
                  </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/55 p-4">
                    <p className="text-sm font-semibold text-slate-400">Pending reviews</p>
                    <p className="mt-2 text-4xl font-black text-amber-200">{pending}</p>
                    <p className="mt-2 text-xs text-slate-500">{stale} older than 7 days</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/55 p-4">
                    <p className="text-sm font-semibold text-slate-400">Approval rate</p>
                    <p className="mt-2 text-4xl font-black text-sky-200">{analytics.submissions.approvalRate}%</p>
                    <p className="mt-2 text-xs text-slate-500">{analytics.submissions.approved} approved results</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/55 p-4">
                    <p className="text-sm font-semibold text-slate-400">Active students</p>
                    <p className="mt-2 text-4xl font-black text-emerald-200">{analytics.activity.activeStudentsLast7Days}</p>
                    <p className="mt-2 text-xs text-slate-500">Submitted in last 7 days</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-bold text-white">Admin Actions</h2>
                <div className="mt-4 grid gap-3">
                  {actions.map(([title, description, href, tone]) => (
                    <Link
                      key={href}
                      href={href}
                      className="group rounded-lg border border-slate-800 bg-slate-950/55 p-4 transition-colors hover:border-sky-500/50 hover:bg-slate-900 focus-ring"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-100">{title}</p>
                          <p className="mt-1 text-sm text-slate-400">{description}</p>
                        </div>
                        <Badge tone={tone}>Open</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Users" value={analytics.users.total} tone="blue" helper={`${analytics.users.students} students, ${analytics.users.teachers} teachers`} />
              <StatCard label="Total Tests" value={analytics.tests.total} tone="teal" helper={`${analytics.tests.published} published`} />
              <StatCard label="Submissions" value={analytics.submissions.total} tone="amber" helper={`${analytics.submissions.passRate}% pass rate`} />
              <StatCard label="Archived Tests" value={analytics.tests.archived} tone="slate" helper={`${analytics.tests.unpublished} drafts`} />
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <Card>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-white">Signals</h2>
                  <Badge tone={healthTone}>{healthLabel}</Badge>
                </div>
                {analytics.alerts.length === 0 ? (
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                    No active alerts. The platform is operating normally.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.alerts.slice(0, 4).map((alert, index) => (
                      <div key={`${alert.title}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950/55 p-4">
                        <div className="mb-2">
                          <Badge tone={alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'amber' : 'blue'}>{alert.type}</Badge>
                        </div>
                        <p className="font-bold text-slate-100">{alert.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-white">Recent Submissions</h2>
                  <Link href="/dashboards/admin/submissions" className="text-sm font-bold text-sky-300 hover:text-sky-200">
                    View all
                  </Link>
                </div>
                {analytics.recentSubmissions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentSubmissions.slice(0, 5).map((submission) => (
                      <div key={submission._id} className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/55 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                          <p className="font-bold text-slate-100">{submission.studentId?.name || 'Unknown student'}</p>
                          <p className="mt-1 text-sm text-slate-400">{submission.testId?.title || 'Deleted test'}</p>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <p className="text-sm font-bold text-slate-100">{submission.score}/{submission.totalMarks}</p>
                          <Badge tone={submission.isApproved ? 'green' : 'amber'}>{submission.isApproved ? 'Approved' : 'Pending'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-4 text-xl font-bold text-white">Top Tests</h2>
                {!analytics.topTestsBySubmissions?.length ? (
                  <p className="py-8 text-center text-sm text-slate-400">No test activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.topTestsBySubmissions.slice(0, 4).map((test) => (
                      <div key={test._id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/55 p-4">
                        <div>
                          <p className="font-bold text-slate-100">{test.title}</p>
                          <p className="mt-1 text-sm text-slate-400">Average {test.avgPercentage}%</p>
                        </div>
                        <Badge tone="blue">{test.submissions} submissions</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="mb-4 text-xl font-bold text-white">Newest Users</h2>
                {analytics.recentUsers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No users yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentUsers.slice(0, 4).map((user) => (
                      <div key={user._id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/55 p-4">
                        <div>
                          <p className="font-bold text-slate-100">{user.name}</p>
                          <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge tone={user.role === 'admin' ? 'blue' : user.role === 'teacher' ? 'teal' : 'slate'}>{user.role}</Badge>
                          <p className={`mt-2 text-xs font-bold ${user.isActive ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
