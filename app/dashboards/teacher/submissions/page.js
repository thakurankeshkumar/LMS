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
    const passMarks = submission?.testId?.passingMarks ?? (submission.totalMarks * 40) / 100;
    return typeof submission.isPassed === 'boolean' ? submission.isPassed : submission.score >= passMarks;
  };

  const pendingSubmissions = submissions.filter((s) => !s.isApproved);
  const approvedSubmissions = submissions.filter((s) => s.isApproved);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="teacher" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Submissions</h1>
          <p className="text-gray-400">Review and approve student submissions</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Pending Submissions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Pending Approval ({pendingSubmissions.length})
          </h2>

          {pendingSubmissions.length === 0 ? (
            <Card>
              <p className="text-gray-400 text-center py-8">No pending submissions</p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-400">Student</th>
                    <th className="text-left py-4 px-4 text-gray-400">Test</th>
                    <th className="text-left py-4 px-4 text-gray-400">Score</th>
                    <th className="text-left py-4 px-4 text-gray-400">Percentage</th>
                    <th className="text-left py-4 px-4 text-gray-400">Submitted</th>
                    <th className="text-left py-4 px-4 text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSubmissions.map((submission) => {
                    const isPassed = getIsPassed(submission);
                    return <tr key={submission._id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-4 px-4 text-white">{submission.studentId.name}</td>
                      <td className="py-4 px-4 text-white">{submission.testId?.title || '—'}</td>
                      <td className="py-4 px-4 text-white">
                        {submission.score}/{submission.totalMarks}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${isPassed ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {submission.percentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/dashboards/teacher/submissions/${submission._id}`}
                          className="text-blue-500 hover:text-blue-400"
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
          <h2 className="text-2xl font-bold text-white mb-4">
            Approved ({approvedSubmissions.length})
          </h2>

          {approvedSubmissions.length === 0 ? (
            <Card>
              <p className="text-gray-400 text-center py-8">No approved submissions</p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-400">Student</th>
                    <th className="text-left py-4 px-4 text-gray-400">Test</th>
                    <th className="text-left py-4 px-4 text-gray-400">Score</th>
                    <th className="text-left py-4 px-4 text-gray-400">Percentage</th>
                    <th className="text-left py-4 px-4 text-gray-400">Approved On</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedSubmissions.map((submission) => {
                    const isPassed = getIsPassed(submission);
                    return <tr key={submission._id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-4 px-4 text-white">{submission.studentId.name}</td>
                      <td className="py-4 px-4 text-white">{submission.testId?.title || '—'}</td>
                      <td className="py-4 px-4 text-white">
                        {submission.score}/{submission.totalMarks}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${isPassed ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {submission.percentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {new Date(submission.approvalDate).toLocaleDateString()}
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
