'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function ArchivedResultPage({ params }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [archived, setArchived] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/archived-tests/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load archived result');
          return;
        }

        setArchived(data.archived || null);
        setResult(data.result || (data.archived?.studentResults?.[0] ?? null));
      } catch (err) {
        setError('Failed to load archived result');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchResult();
    }
  }, [session, id]);

  if (status === 'loading' || loading) return <Loading />;

  const passMarks = archived?.passingMarks ?? (result?.totalMarks ? (result.totalMarks * 40) / 100 : 0);
  const isPassed = result ? (typeof result.passed === 'boolean' ? result.passed : result.score >= passMarks) : false;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="student" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && <Alert type="error" message={error} />}

        {result && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Archived Test Result</h1>
              <p className="text-gray-400">{archived?.title || '—'}</p>
            </div>

            <Card className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Your Score</p>
                  <p className="text-4xl font-bold text-blue-500">{result.score}</p>
                  <p className="text-gray-400 text-sm">/ {result.totalMarks}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Percentage</p>
                  <p className={`text-4xl font-bold ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                    {result.percentage.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Status</p>
                  <p className="text-lg font-bold text-green-500">Archived</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Result</p>
                  <p className={`text-lg font-bold ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                    {isPassed ? 'PASSED' : 'FAILED'}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-white mb-4">Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Submitted At</p>
                  <p className="text-white font-semibold">{new Date(result.submittedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Time Taken</p>
                  <p className="text-white font-semibold">{(result.timeTaken / 60).toFixed(2)} min</p>
                </div>
                <div>
                  <p className="text-gray-400">Questions</p>
                  <p className="text-white font-semibold">{archived?.questionCount || 0}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
