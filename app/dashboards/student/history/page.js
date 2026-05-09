'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function StudentHistory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (session?.user?.role !== 'student') {
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
        setError('Failed to load history');
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

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="student" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Test History</h1>
          <p className="text-gray-400">All your test submissions</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {submissions.length === 0 ? (
          <Card>
            <p className="text-gray-400 text-center py-8">No submissions yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission._id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{submission.testId?.title || '—'}</h3>
                    <div className="flex gap-6 mt-2 text-sm text-gray-400">
                      <span>Score: {submission.score}/{submission.totalMarks}</span>
                      <span>Percentage: {submission.percentage.toFixed(2)}%</span>
                      <span>
                        Status:{' '}
                        <span className={submission.isApproved ? 'text-green-500' : 'text-yellow-500'}>
                          {submission.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </span>
                      <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboards/student/result/${submission._id}`}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
