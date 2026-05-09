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
    if (status === 'unauthenticated') {
      router.push('/auth/login');
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
