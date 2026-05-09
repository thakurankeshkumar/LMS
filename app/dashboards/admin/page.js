'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

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

    if (session) {
      fetchAnalytics();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="admin" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">System overview and management</p>
        </div>

        {analytics && (
          <>
            {/* Alerts */}
            <Card className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Operations Alerts</h2>
                  <p className="text-gray-400">Issues and signals that need admin attention</p>
                </div>
                <span className="text-sm text-gray-400">{analytics.alerts.length} active</span>
              </div>

              {analytics.alerts.length === 0 ? (
                <div className="rounded-lg border border-emerald-700 bg-emerald-950/40 px-4 py-3 text-emerald-300">
                  System is healthy. No active alerts.
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.alerts.map((alert, index) => (
                    <div
                      key={`${alert.title}-${index}`}
                      className={`rounded-lg border px-4 py-3 ${
                        alert.type === 'error'
                          ? 'border-red-800 bg-red-950/40 text-red-200'
                          : alert.type === 'warning'
                          ? 'border-yellow-800 bg-yellow-950/40 text-yellow-200'
                          : 'border-sky-800 bg-sky-950/40 text-sky-200'
                      }`}
                    >
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-sm opacity-90">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Total Users</p>
                  <p className="text-4xl font-bold text-blue-500">{analytics.users.total}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Students</p>
                  <p className="text-4xl font-bold text-green-500">{analytics.users.students}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Teachers</p>
                  <p className="text-4xl font-bold text-purple-500">{analytics.users.teachers}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Total Tests</p>
                  <p className="text-4xl font-bold text-yellow-500">{analytics.tests.total}</p>
                </div>
              </Card>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Pass Rate</p>
                  <p className="text-3xl font-bold text-emerald-500">{analytics.submissions.passRate}%</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Approval Rate</p>
                  <p className="text-3xl font-bold text-cyan-500">{analytics.submissions.approvalRate}%</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Active Students (7d)</p>
                  <p className="text-3xl font-bold text-indigo-400">{analytics.activity.activeStudentsLast7Days}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Stale Pending (&gt;7d)</p>
                  <p className={`text-3xl font-bold ${analytics.submissions.stalePendingOver7Days > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {analytics.submissions.stalePendingOver7Days}
                  </p>
                </div>
              </Card>
            </div>

            {/* Submissions Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Total Submissions</p>
                  <p className="text-3xl font-bold text-blue-500">{analytics.submissions.total}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Approved</p>
                  <p className="text-3xl font-bold text-green-500">{analytics.submissions.approved}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Pending</p>
                  <p className="text-3xl font-bold text-yellow-500">{analytics.submissions.pending}</p>
                </div>
              </Card>
            </div>

            {/* User Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <h2 className="text-2xl font-bold text-white mb-4">Recent Users</h2>
                {analytics.recentUsers.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No recent users</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between rounded-lg bg-gray-700 px-4 py-3">
                        <div>
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide text-gray-400">{user.role}</p>
                          <p className={`text-xs font-semibold ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-white mb-4">Recent Tests</h2>
                {analytics.recentTests.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No recent tests</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentTests.map((test) => (
                      <div key={test._id} className="rounded-lg bg-gray-700 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-white font-semibold">{test.title}</p>
                            <p className="text-gray-400 text-sm">By {test.teacherId?.name || 'Unknown Teacher'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${test.isPublished ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                            {test.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                          <span>{test.questions?.length || 0} questions</span>
                          <span>{new Date(test.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Test Governance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Published Tests</p>
                  <p className="text-3xl font-bold text-green-500">{analytics.tests.published}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Unpublished Tests</p>
                  <p className="text-3xl font-bold text-orange-500">{analytics.tests.unpublished}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Negative Marking Tests</p>
                  <p className="text-3xl font-bold text-rose-400">{analytics.tests.negativeMarkingEnabled}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Archived Tests</p>
                  <p className="text-3xl font-bold text-slate-300">{analytics.tests.archived}</p>
                </div>
              </Card>
            </div>

            {/* Quality Snapshot */}
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Quality Snapshot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-white">{analytics.submissions.averageScore}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Average Percentage</p>
                  <p className="text-2xl font-bold text-white">{analytics.submissions.averagePercentage}%</p>
                </div>
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Role Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-gray-400 text-sm mb-1">Students</p>
                  <p className="text-2xl font-bold text-green-400">{analytics.users.students}</p>
                </div>
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-gray-400 text-sm mb-1">Teachers</p>
                  <p className="text-2xl font-bold text-purple-400">{analytics.users.teachers}</p>
                </div>
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-gray-400 text-sm mb-1">Inactive Accounts</p>
                  <p className="text-2xl font-bold text-red-400">{analytics.activity.inactiveUsers}</p>
                </div>
              </div>
            </Card>

            {/* Top Tests */}
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Top Tests By Submissions</h2>
              {!analytics.topTestsBySubmissions || analytics.topTestsBySubmissions.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No test activity yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topTestsBySubmissions.map((test) => (
                    <div key={test._id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{test.title}</p>
                        <p className="text-gray-400 text-sm">Avg %: {test.avgPercentage}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Submissions</p>
                        <p className="text-xl font-bold text-blue-400">{test.submissions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/dashboards/admin/users"
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
                >
                  <p className="font-semibold">Manage Users</p>
                  <p className="text-sm text-gray-400">Add, edit, or delete users</p>
                </a>
                <a
                  href="/dashboards/admin/settings"
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
                >
                  <p className="font-semibold">Settings</p>
                  <p className="text-sm text-gray-400">Configure system settings</p>
                </a>
                <a
                  href="/dashboards/admin/submissions"
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
                >
                  <p className="font-semibold">All Submissions</p>
                  <p className="text-sm text-gray-400">View all test submissions</p>
                </a>
              </div>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <h2 className="text-2xl font-bold text-white mb-4">Recent Submissions</h2>
              {analytics.recentSubmissions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No submissions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400">Student</th>
                        <th className="text-left py-3 px-4 text-gray-400">Test</th>
                        <th className="text-left py-3 px-4 text-gray-400">Score</th>
                        <th className="text-left py-3 px-4 text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentSubmissions.map((submission) => (
                        <tr key={submission._id} className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="py-3 px-4 text-white">{submission.studentId.name}</td>
                          <td className="py-3 px-4 text-white">{submission.testId?.title || '—'}</td>
                          <td className="py-3 px-4 text-white">
                            {submission.score}/{submission.totalMarks}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-sm font-semibold ${
                                submission.isApproved
                                  ? 'bg-green-900 text-green-200'
                                  : 'bg-yellow-900 text-yellow-200'
                              }`}
                            >
                              {submission.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
