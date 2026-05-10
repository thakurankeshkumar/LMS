'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function TeacherSubmissions() {
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

    if (session?.user?.role !== 'teacher') {
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

  const safeSubmissions = Array.isArray(submissions) ? submissions : [];
  const pendingSubmissions = safeSubmissions.filter((s) => !s?.isApproved);
  const approvedSubmissions = safeSubmissions.filter((s) => s?.isApproved);

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="teacher" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Submissions</h1>
          <p className="text-slate-400">Review and approve student submissions</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Pending Submissions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">
            Pending Approval ({pendingSubmissions.length})
          </h2>

          {pendingSubmissions.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-center py-8">No pending submissions</p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-4 px-4 text-slate-400">Student</th>
                    <th className="text-left py-4 px-4 text-slate-400">Test</th>
                    <th className="text-left py-4 px-4 text-slate-400">Score</th>
                    <th className="text-left py-4 px-4 text-slate-400">Percentage</th>
                    <th className="text-left py-4 px-4 text-slate-400">Submitted</th>
                    <th className="text-left py-4 px-4 text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSubmissions.map((submission, index) => {
                    const isPassed = getIsPassed(submission);
                    const studentName = submission?.studentId?.name || 'Unknown Student';
                    const testTitle = submission?.testId?.title || 'Untitled Test';
                    const score = Number(submission?.score ?? 0);
                    const totalMarks = Number(submission?.totalMarks ?? 0);
                    const percentage = Number(submission?.percentage ?? 0);
                    const submittedDate = submission?.submittedAt
                      ? new Date(submission.submittedAt).toLocaleDateString()
                      : '—';

                    return <tr key={submission?._id || `pending-${index}`} className="border-b border-slate-800 hover:bg-slate-900">
                      <td className="py-4 px-4 text-slate-100">{studentName}</td>
                      <td className="py-4 px-4 text-slate-100">{testTitle}</td>
                      <td className="py-4 px-4 text-slate-100">
                        {score}/{totalMarks}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${isPassed ? 'text-emerald-300' : 'text-red-500'}`}
                        >
                          {percentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {submittedDate}
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={submission?._id ? `/dashboards/teacher/submissions/${submission._id}` : '/dashboards/teacher/submissions'}
                          className="text-sky-300 hover:text-blue-400"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approved Submissions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4">
            Approved ({approvedSubmissions.length})
          </h2>

          {approvedSubmissions.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-center py-8">No approved submissions</p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-4 px-4 text-slate-400">Student</th>
                    <th className="text-left py-4 px-4 text-slate-400">Test</th>
                    <th className="text-left py-4 px-4 text-slate-400">Score</th>
                    <th className="text-left py-4 px-4 text-slate-400">Percentage</th>
                    <th className="text-left py-4 px-4 text-slate-400">Approved On</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedSubmissions.map((submission, index) => {
                    const isPassed = getIsPassed(submission);
                    const studentName = submission?.studentId?.name || 'Unknown Student';
                    const testTitle = submission?.testId?.title || 'Untitled Test';
                    const score = Number(submission?.score ?? 0);
                    const totalMarks = Number(submission?.totalMarks ?? 0);
                    const percentage = Number(submission?.percentage ?? 0);
                    const approvalDate = submission?.approvalDate
                      ? new Date(submission.approvalDate).toLocaleDateString()
                      : '—';

                    return <tr key={submission?._id || `approved-${index}`} className="border-b border-slate-800 hover:bg-slate-900">
                      <td className="py-4 px-4 text-slate-100">{studentName}</td>
                      <td className="py-4 px-4 text-slate-100">{testTitle}</td>
                      <td className="py-4 px-4 text-slate-100">
                        {score}/{totalMarks}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${isPassed ? 'text-emerald-300' : 'text-red-500'}`}
                        >
                          {percentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {approvalDate}
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
