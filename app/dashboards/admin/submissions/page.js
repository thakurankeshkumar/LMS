'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function AdminSubmissions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/submissions');
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        setError('Failed to load submissions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchSubmissions();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  const pendingSubmissions = submissions.filter((s) => !s.isApproved);
  const approvedSubmissions = submissions.filter((s) => s.isApproved);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="admin" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">All Submissions</h1>
          <p className="text-gray-400">Monitor all test submissions across the system</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Total Submissions</p>
              <p className="text-4xl font-bold text-blue-500">{submissions.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Pending Review</p>
              <p className="text-4xl font-bold text-yellow-500">{pendingSubmissions.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Approved</p>
              <p className="text-4xl font-bold text-green-500">{approvedSubmissions.length}</p>
            </div>
          </Card>
        </div>

        {/* All Submissions */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-6">Submissions Report</h2>

          {submissions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Student</th>
                    <th className="text-left py-3 px-4 text-gray-400">Test</th>
                    <th className="text-left py-3 px-4 text-gray-400">Score</th>
                    <th className="text-left py-3 px-4 text-gray-400">%</th>
                    <th className="text-left py-3 px-4 text-gray-400">Result</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-3 px-4 text-white">{submission.studentId.name}</td>
                      <td className="py-3 px-4 text-white">{submission.testId?.title || '—'}</td>
                      <td className="py-3 px-4 text-white">
                        {submission.score}/{submission.totalMarks}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            submission.percentage >= 40 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {submission.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            submission.percentage >= 40
                              ? 'bg-green-900 text-green-200'
                              : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {submission.percentage >= 40 ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
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
      </main>
    </div>
  );
}
