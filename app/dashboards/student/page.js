'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
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
    <div className="min-h-screen bg-gray-900">
      <Navbar role="student" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, {session.user.name}!</h1>
          <p className="text-gray-400">Your learning dashboard</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Assigned Tests</p>
                <p className="text-4xl font-bold text-blue-500">{stats.assignedTests}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Completed</p>
                <p className="text-4xl font-bold text-green-500">{stats.completedTests}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Pending</p>
                <p className="text-4xl font-bold text-yellow-500">{stats.pendingTests}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Approved Results</p>
                <p className="text-4xl font-bold text-purple-500">{stats.approvedResults}</p>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-3">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/dashboards/student/tests"
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
              >
                <p className="font-semibold">Take Tests</p>
                <p className="text-sm text-gray-400">Start assigned tests</p>
              </a>
              <a
                href="/dashboards/student/results"
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
              >
                <p className="font-semibold">View Results</p>
                <p className="text-sm text-gray-400">Check your approved results</p>
              </a>
              <a
                href="/dashboards/student/history"
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
              >
                <p className="font-semibold">Test History</p>
                <p className="text-sm text-gray-400">View past submissions</p>
              </a>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
