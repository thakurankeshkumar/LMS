'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function StudentResults() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/submissions');
        const data = await response.json();
        const approved = data.submissions.filter((s) => s.isApproved);
        setSubmissions(approved);
      } catch (err) {
        setError('Failed to load results');
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

  const getIsPassed = (submission) => {
    const passMarks = submission?.testId?.passingMarks ?? (submission.totalMarks * 40) / 100;
    return typeof submission.isPassed === 'boolean' ? submission.isPassed : submission.score >= passMarks;
  };

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="student" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Your Results</h1>
          <p className="text-slate-400">Approved test results</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {submissions.length === 0 ? (
          <Card>
            <p className="text-slate-400 text-center py-8">No approved results yet</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-4 text-slate-400">Test Name</th>
                  <th className="text-left py-4 px-4 text-slate-400">Score</th>
                  <th className="text-left py-4 px-4 text-slate-400">Percentage</th>
                  <th className="text-left py-4 px-4 text-slate-400">Result</th>
                  <th className="text-left py-4 px-4 text-slate-400">Submitted</th>
                  <th className="text-left py-4 px-4 text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => {
                  const isPassed = getIsPassed(submission);
                  return (
                  <tr key={submission._id} className="border-b border-slate-800 hover:bg-slate-900">
                    <td className="py-4 px-4 text-slate-100">{submission.testId?.title || 'Unknown Test'}</td>
                    <td className="py-4 px-4 text-slate-100">
                      {submission.score}/{submission.totalMarks}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-semibold ${isPassed ? 'text-emerald-300' : 'text-red-500'}`}
                      >
                        {typeof submission.percentage === 'number' ? submission.percentage.toFixed(2) + '%' : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${isPassed ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                      >
                        {typeof submission.percentage === 'number' ? (isPassed ? 'PASSED' : 'FAILED') : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/dashboards/student/result/${submission._id}`}
                        className="text-sky-300 hover:text-blue-400"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
