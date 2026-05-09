'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function ResultPage({ params }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submission, setSubmission] = useState(null);
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
        const response = await fetch(`/api/submissions/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load result');
          return;
        }

        setSubmission(data.submission);
      } catch (err) {
        setError('Failed to load result');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchResult();
    }
  }, [session, id]);

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="student" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && <Alert type="error" message={error} />}

        {submission && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Test Result</h1>
              <p className="text-gray-400">{submission.testId?.title || '—'}</p>
            </div>

            {!submission.isApproved && (
              <Alert 
                type="warning" 
                message="⏳ Your test result is pending teacher approval. Please check back later." 
                onClose={() => {}}
              />
            )}

            {submission.isApproved ? (
              <>
                {/* Score Card */}
                <Card className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Your Score</p>
                      <p className="text-4xl font-bold text-blue-500">{submission.score}</p>
                      <p className="text-gray-400 text-sm">/ {submission.totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Percentage</p>
                      <p className={`text-4xl font-bold ${submission.percentage >= 40 ? 'text-green-500' : 'text-red-500'}`}>
                        {submission.percentage.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Status</p>
                      <p className="text-lg font-bold text-green-500">
                        Approved
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Result</p>
                      <p className={`text-lg font-bold ${submission.percentage >= 40 ? 'text-green-500' : 'text-red-500'}`}>
                        {submission.percentage >= 40 ? 'PASSED' : 'FAILED'}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="mb-8">
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg mb-2">Your test has been submitted successfully!</p>
                  <p className="text-gray-500">Results will be displayed here once your teacher approves them.</p>
                  <p className="text-gray-600 text-sm mt-4">Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}</p>
                </div>
              </Card>
            )}

            {/* Details */}
            {submission.isApproved && (
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Submitted At</p>
                  <p className="text-white font-semibold">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Time Taken</p>
                  <p className="text-white font-semibold">{(submission.timeTaken / 60).toFixed(2)} min</p>
                </div>
                <div>
                  <p className="text-gray-400">Questions</p>
                  <p className="text-white font-semibold">{submission.answers.length}</p>
                </div>
                {submission.isApproved && (
                  <div>
                    <p className="text-gray-400">Approved On</p>
                    <p className="text-white font-semibold">{new Date(submission.approvalDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </Card>
            )}

            {submission.remarks && (
              <Card>
                {submission.isApproved && (
                  <>
                    <h2 className="text-xl font-bold text-white mb-4">Remarks</h2>
                    <p className="text-gray-300">{submission.remarks}</p>
                  </>
                )}
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
