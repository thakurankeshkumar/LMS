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
  const [canViewAnswerReview, setCanViewAnswerReview] = useState(false);
  const [answerReviewEnabled, setAnswerReviewEnabled] = useState(true);
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
        const [submissionResponse, configResponse] = await Promise.all([
          fetch(`/api/submissions/${id}`),
          fetch('/api/users/config'),
        ]);
        const data = await submissionResponse.json();
        const configData = await configResponse.json();

        if (!submissionResponse.ok) {
          setError(data.message || 'Failed to load result');
          return;
        }

        setSubmission(data.submission);
        setCanViewAnswerReview(Boolean(data?.canViewAnswerReview));
        setAnswerReviewEnabled(configData?.config?.studentAnswerReviewEnabled ?? true);
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

  const passMarks = submission?.testId?.passingMarks ?? (submission?.totalMarks ? (submission.totalMarks * 40) / 100 : 0);
  const isPassed = submission ? (typeof submission.isPassed === 'boolean' ? submission.isPassed : submission.score >= passMarks) : false;
  const score = Number(submission?.score ?? 0);
  const totalMarks = Number(submission?.totalMarks ?? 0);
  const percentage = Number(submission?.percentage ?? 0);
  const timeTaken = Number(submission?.timeTaken ?? 0);
  const answers = submission?.answers ?? [];
  const questions = submission?.testId?.questions ?? [];
  const showAnswerReview = submission?.isApproved && canViewAnswerReview && answerReviewEnabled && questions.length > 0;

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="student" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && <Alert type="error" message={error} />}

        {submission && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-100 mb-2">Test Result</h1>
              <p className="text-slate-400">{submission.testId?.title || '—'}</p>
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
                      <p className="text-slate-400 text-sm mb-2">Your Score</p>
                      <p className="text-4xl font-bold text-sky-300">{score}</p>
                      <p className="text-slate-400 text-sm">/ {totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Percentage</p>
                      <p className={`text-4xl font-bold ${isPassed ? 'text-emerald-300' : 'text-red-500'}`}>
                        {percentage.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Status</p>
                      <p className="text-lg font-bold text-emerald-300">
                        Approved
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Result</p>
                      <p className={`text-lg font-bold ${isPassed ? 'text-emerald-300' : 'text-red-500'}`}>
                        {isPassed ? 'PASSED' : 'FAILED'}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="mb-8">
                <div className="text-center py-8">
                  <p className="text-slate-400 text-lg mb-2">Your test has been submitted successfully!</p>
                  <p className="text-slate-500">Results will be displayed here once your teacher approves them.</p>
                  <p className="text-slate-400 text-sm mt-4">Submitted on: {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '—'}</p>
                </div>
              </Card>
            )}

            {/* Details */}
            {submission.isApproved && (
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-slate-100 mb-4">Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Submitted At</p>
                  <p className="text-slate-100 font-semibold">{submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Time Taken</p>
                  <p className="text-slate-100 font-semibold">{(timeTaken / 60).toFixed(2)} min</p>
                </div>
                <div>
                  <p className="text-slate-400">Questions</p>
                  <p className="text-slate-100 font-semibold">{answers.length}</p>
                </div>
                {submission.isApproved && (
                  <div>
                    <p className="text-slate-400">Approved On</p>
                    <p className="text-slate-100 font-semibold">{submission?.approvalDate ? new Date(submission.approvalDate).toLocaleDateString() : '—'}</p>
                  </div>
                )}
              </div>
            </Card>
            )}

            {submission.isApproved && !showAnswerReview && (
              <Card className="mb-8">
                <h2 className="text-xl font-bold text-slate-100 mb-3">Answer Review</h2>
                <p className="text-slate-400">
                  Detailed answer review is unavailable because it is disabled or this test is no longer active.
                </p>
              </Card>
            )}

            {showAnswerReview && (
              <Card className="mb-8">
                <h2 className="text-xl font-bold text-slate-100 mb-6">Your Answers vs Correct Answers</h2>

                {answers.map((answer, index) => {
                  const question = questions[index];
                  const selectedOption = answer?.selectedOption;
                  const correctOption = question?.correctAnswer;

                  return (
                    <div key={`${submission?._id || 'submission'}-answer-${index}`} className="mb-6 border-b border-slate-800 pb-6 last:border-b-0">
                      <p className="mb-1 text-sm text-slate-400">Question {index + 1}</p>
                      <p className="mb-3 font-semibold text-slate-100">{question?.question || 'Question text unavailable'}</p>

                      <div className="space-y-2">
                        {(question?.options ?? []).map((option, optionIndex) => {
                          const isSelected = optionIndex === selectedOption;
                          const isCorrect = optionIndex === correctOption;

                          return (
                            <div
                              key={`${submission?._id || 'submission'}-${index}-${optionIndex}`}
                              className={`rounded-lg border p-3 ${
                                isSelected && isCorrect
                                  ? 'border-green-500 bg-green-900/20'
                                  : isSelected
                                  ? 'border-red-500 bg-red-900/20'
                                  : isCorrect
                                  ? 'border-emerald-500 bg-emerald-900/10'
                                  : 'border-slate-700 bg-slate-950/55'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-semibold ${
                                    isSelected && isCorrect
                                      ? 'text-green-300'
                                      : isSelected
                                      ? 'text-red-300'
                                      : isCorrect
                                      ? 'text-emerald-300'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {isSelected ? 'Your answer' : ''} {isCorrect ? 'Correct answer' : ''}
                                </span>
                                <span className="text-slate-100">{option}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {answers.length === 0 && (
                  <p className="text-slate-400">No answer data is available for this submission.</p>
                )}
              </Card>
            )}

            {submission.remarks && (
              <Card>
                {submission.isApproved && (
                  <>
                    <h2 className="text-xl font-bold text-slate-100 mb-4">Remarks</h2>
                    <p className="text-slate-300">{submission.remarks}</p>
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
