'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
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
    <div className="min-h-screen bg-gray-900">
      <Navbar role="teacher" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, {session.user.name}!</h1>
          <p className="text-gray-400">Manage your tests and submissions</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">My Tests</p>
                <p className="text-4xl font-bold text-blue-500">{stats.totalTests}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Total Submissions</p>
                <p className="text-4xl font-bold text-green-500">{stats.totalSubmissions}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Pending Approval</p>
                <p className="text-4xl font-bold text-yellow-500">{stats.pendingApproval}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Approved</p>
                <p className="text-4xl font-bold text-purple-500">{stats.approved}</p>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-3">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboards/teacher/tests"
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
              >
                <p className="font-semibold">My Tests</p>
                <p className="text-sm text-gray-400">View and manage tests</p>
              </Link>
              <Link
                href="/dashboards/teacher/create-test"
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
              >
                <p className="font-semibold">Create Test</p>
                <p className="text-sm text-gray-400">Create a new test</p>
              </Link>
              <Link
                href="/dashboards/teacher/submissions"
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center transition-colors"
              >
                <p className="font-semibold">Submissions</p>
                <p className="text-sm text-gray-400">Review & approve submissions</p>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
