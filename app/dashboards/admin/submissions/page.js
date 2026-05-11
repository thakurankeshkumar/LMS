'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';
import Button from '@/app/components/Button';
import Link from 'next/link';

export default function AdminSubmissions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState('');

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

  const getIsPassed = (submission) => {
    const totalMarks = Number(submission?.totalMarks ?? 0);
    const passMarks = submission?.testId?.passingMarks ?? (totalMarks * 40) / 100;
    const score = Number(submission?.score ?? 0);
    return typeof submission?.isPassed === 'boolean' ? submission.isPassed : score >= passMarks;
  };

  const safeSubmissions = Array.isArray(submissions) ? submissions.filter(Boolean) : [];
  const pendingSubmissions = safeSubmissions.filter((s) => !s?.isApproved);
  const approvedSubmissions = safeSubmissions.filter((s) => s?.isApproved);

  const handleApproveSubmission = async (submissionId) => {
    setApprovingId(submissionId);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'Approved by admin' }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissions((current) =>
          current.map((item) => (item._id === submissionId ? data.submission : item))
        );
      } else {
        setError(data.message || 'Failed to approve submission');
      }
    } catch (err) {
      setError('Failed to approve submission');
      console.error(err);
    } finally {
      setApprovingId('');
    }
  };

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="admin" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">All Submissions</h1>
          <p className="text-slate-400">Monitor all test submissions across the system</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Total Submissions</p>
              <p className="text-4xl font-bold text-sky-300">{submissions.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Pending Review</p>
              <p className="text-4xl font-bold text-amber-300">{pendingSubmissions.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Approved</p>
              <p className="text-4xl font-bold text-emerald-300">{approvedSubmissions.length}</p>
            </div>
          </Card>
        </div>

        {/* All Submissions */}
        <Card>
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Submissions Report</h2>

          {safeSubmissions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400">Student</th>
                    <th className="text-left py-3 px-4 text-slate-400">Test</th>
                    <th className="text-left py-3 px-4 text-slate-400">Score</th>
                    <th className="text-left py-3 px-4 text-slate-400">%</th>
                    <th className="text-left py-3 px-4 text-slate-400">Result</th>
                    <th className="text-left py-3 px-4 text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400">Date</th>
                    <th className="text-left py-3 px-4 text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeSubmissions.map((submission, index) => {
                    const isPassed = getIsPassed(submission);
                    const studentName = submission?.studentId?.name || 'Unknown Student';
                    const testTitle = submission?.testId?.title || 'Untitled Test';
                    const score = Number(submission?.score ?? 0);
                    const totalMarks = Number(submission?.totalMarks ?? 0);
                    const percentage = Number(submission?.percentage ?? 0);
                    const submittedDate = submission?.submittedAt
                      ? new Date(submission.submittedAt).toLocaleDateString()
                      : '—';

                    return (
                      <tr key={submission?._id || `submission-${index}`} className="border-b border-slate-800 hover:bg-slate-900">
                      <td className="py-3 px-4 text-slate-100">{studentName}</td>
                      <td className="py-3 px-4 text-slate-100">{testTitle}</td>
                      <td className="py-3 px-4 text-slate-100">
                        {score}/{totalMarks}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${isPassed ? 'text-emerald-300' : 'text-red-500'}`}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${isPassed ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                        >
                          {isPassed ? 'PASS' : 'FAIL'}
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
                      <td className="py-3 px-4 text-slate-400">
                        {submittedDate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          {!submission?.isApproved ? (
                            <Button
                              onClick={() => handleApproveSubmission(submission?._id)}
                              disabled={approvingId === submission?._id || !submission?._id}
                              className="px-3 py-2 text-xs"
                            >
                              {approvingId === submission?._id ? 'Approving...' : 'Approve'}
                            </Button>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-900 text-green-200">
                              Approved
                            </span>
                          )}
                          {submission?._id && (
                            <Link
                              href={`/dashboards/teacher/submissions/${submission._id}`}
                              className="rounded-md px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-400/10"
                            >
                              Review
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
