'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';
import { useToast } from '@/app/components/Feedback';
import { PageHeader, StatCard } from '@/app/components/DashboardUI';

export default function ReviewSubmissionPage({ params }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [submission, setSubmission] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const { notify, Toast } = useToast();

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
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/submissions/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load submission');
          return;
        }

        setSubmission(data.submission);

        // Fetch test details
        const testId = data?.submission?.testId?._id;
        if (!testId) {
          setTest({
            title: data?.submission?.testId?.title || 'Untitled test',
            questions: [],
          });
          return;
        }

        const testResponse = await fetch(`/api/tests/${testId}`);
        const testData = await testResponse.json();
        setTest(testData?.test || { title: 'Untitled test', questions: [] });
      } catch (err) {
        setError('Failed to load submission');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchSubmission();
    }
  }, [session, id]);

  const handleApprove = async () => {
    if (!submission) return;

    setApproving(true);
    try {
      const response = await fetch(`/api/submissions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks }),
      });

      const data = await response.json();

      if (response.ok) {
        notify('Submission approved successfully');
        window.setTimeout(() => router.push('/dashboards/teacher/submissions'), 700);
      } else {
        setError(data.message || 'Failed to approve submission');
      }
    } catch (err) {
      setError('Failed to approve submission');
      console.error(err);
    } finally {
      setApproving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  const passMarks = test?.passingMarks ?? (submission?.totalMarks ? (submission.totalMarks * 40) / 100 : 0);
  const isPassed = submission ? (typeof submission.isPassed === 'boolean' ? submission.isPassed : submission.score >= passMarks) : false;

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="teacher" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {error && <Alert type="error" message={error} />}

        {submission && (
          <>
            <PageHeader
              eyebrow="Submission review"
              title="Review Submission"
              description={`${submission?.studentId?.name || 'Unknown Student'} - ${submission?.testId?.title || test?.title || 'Untitled test'}`}
            />

            {/* Score Card */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Score" value={`${Number(submission?.score ?? 0)}/${Number(submission?.totalMarks ?? 0)}`} tone="blue" />
              <StatCard label="Percentage" value={`${Number(submission?.percentage ?? 0).toFixed(2)}%`} tone={isPassed ? 'green' : 'red'} />
              <StatCard label="Result" value={isPassed ? 'Passed' : 'Failed'} tone={isPassed ? 'green' : 'red'} />
              <StatCard label="Time Taken" value={`${(Number(submission?.timeTaken ?? 0) / 60).toFixed(2)} min`} tone="slate" />
              </div>

            {/* Answers */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Answers</h2>

              {(submission?.answers ?? []).map((answer, index) => {
                const question = test?.questions?.[index];
                const isCorrect = answer.isCorrect;

                return (
                  <div key={index} className="mb-6 pb-6 border-b border-slate-800 last:border-b-0">
                    <div className="mb-3">
                      <p className="text-slate-400 text-sm">Question {index + 1}</p>
                      <p className="text-slate-100 font-semibold">{question?.question || 'Question text unavailable'}</p>
                    </div>

                    <div className="space-y-2 mb-3">
                      {(question?.options ?? []).map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === answer.selectedOption
                              ? isCorrect
                                ? 'border-green-500 bg-green-900 bg-opacity-20'
                                : 'border-red-500 bg-red-900 bg-opacity-20'
                                : optionIndex === question?.correctAnswer
                              ? 'border-green-500 bg-green-900 bg-opacity-10'
                              : 'border-slate-700 bg-slate-950/55'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                optionIndex === answer.selectedOption
                                  ? isCorrect
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                  : optionIndex === question?.correctAnswer
                                  ? 'text-green-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {optionIndex === answer?.selectedOption && '👤'} {optionIndex === question?.correctAnswer && '✓'}
                            </span>
                            <span className="text-slate-100">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {question?.explanation && (
                      <div className="bg-slate-950/55 p-3 rounded-lg">
                        <p className="text-slate-400 text-sm">Explanation:</p>
                        <p className="text-slate-100">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {(submission?.answers?.length ?? 0) === 0 && (
                <p className="text-slate-400">No answer data is available for this submission.</p>
              )}
            </Card>

            {/* Approval Section */}
            {!submission.isApproved && (
              <Card>
                <h2 className="text-xl font-bold text-slate-100 mb-4">Approve Submission</h2>

                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Remarks (Optional)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any remarks or feedback for the student..."
                    className="w-full px-4 py-2 bg-slate-900 text-slate-100 border border-slate-800 rounded-lg focus:border-blue-500 focus-ring min-h-24"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => router.back()}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApprove}
                    variant="success"
                    disabled={approving}
                    className="flex-1"
                  >
                    {approving ? 'Approving...' : 'Approve Submission'}
                  </Button>
                </div>
              </Card>
            )}

            {submission.isApproved && (
              <Card>
                <div className="text-center">
                  <p className="text-green-400 font-semibold mb-2">✓ Already Approved</p>
                  <p className="text-slate-400">Approved on {submission?.approvalDate ? new Date(submission.approvalDate).toLocaleDateString() : '—'}</p>
                  {submission.remarks && (
                    <p className="text-slate-300 mt-4">{submission.remarks}</p>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
        <Toast />
      </main>
    </div>
  );
}
