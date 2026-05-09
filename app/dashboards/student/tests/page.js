'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import TestCard from '@/app/components/TestCard';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function StudentTests() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [submittedTestIds, setSubmittedTestIds] = useState([]);
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
    const fetchTests = async () => {
      try {
        // Fetch available tests
        const testsResponse = await fetch('/api/tests');
        const testsData = await testsResponse.json();
        setTests(testsData.tests || []);

        // Fetch student submissions to check which tests they already took
        const submissionsResponse = await fetch('/api/submissions');
        const submissionsData = await submissionsResponse.json();
        const submittedIds = submissionsData.submissions
          ?.map((sub) => (sub.testId ? (sub.testId._id || sub.testId) : null))
          .filter(Boolean) || [];
        setSubmittedTestIds(submittedIds);
      } catch (err) {
        setError('Failed to load tests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTests();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="student" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Available Tests</h1>
          <p className="text-slate-400">Select a test to begin</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No tests assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                isAlreadyTaken={submittedTestIds.includes(test._id)}
                onStart={(testId) => router.push(`/dashboards/student/test/${testId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
