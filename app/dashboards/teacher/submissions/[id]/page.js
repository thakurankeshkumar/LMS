'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

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
        const testResponse = await fetch(`/api/tests/${data.submission.testId._id}`);
        const testData = await testResponse.json();
        setTest(testData.test);
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
        alert('Submission approved successfully');
        router.push('/dashboards/teacher/submissions');
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
    <div className="min-h-screen bg-gray-900">
      <Navbar role="teacher" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && <Alert type="error" message={error} />}

        {submission && test && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Review Submission</h1>
              <p className="text-gray-400">
                {submission.studentId.name} - {submission.testId?.title || '—'}
              </p>
            </div>

            {/* Score Card */}
            <Card className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Score</p>
                  <p className="text-3xl font-bold text-blue-500">{submission.score}/{submission.totalMarks}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Percentage</p>
                  <p className={`text-3xl font-bold ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                    {submission.percentage.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Result</p>
                  <p className={`text-lg font-bold ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                    {isPassed ? 'PASSED' : 'FAILED'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Time Taken</p>
                  <p className="text-white font-semibold">{(submission.timeTaken / 60).toFixed(2)} min</p>
                </div>
              </div>
            </Card>

            {/* Answers */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Answers</h2>

              {submission.answers.map((answer, index) => {
                const question = test.questions[index];
                const isCorrect = answer.isCorrect;

                return (
                  <div key={index} className="mb-6 pb-6 border-b border-gray-700 last:border-b-0">
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm">Question {index + 1}</p>
                      <p className="text-white font-semibold">{question.question}</p>
                    </div>

                    <div className="space-y-2 mb-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === answer.selectedOption
                              ? isCorrect
                                ? 'border-green-500 bg-green-900 bg-opacity-20'
                                : 'border-red-500 bg-red-900 bg-opacity-20'
                              : optionIndex === question.correctAnswer
                              ? 'border-green-500 bg-green-900 bg-opacity-10'
                              : 'border-gray-600 bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                optionIndex === answer.selectedOption
                                  ? isCorrect
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                  : optionIndex === question.correctAnswer
                                  ? 'text-green-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              {optionIndex === answer.selectedOption && '👤'} {optionIndex === question.correctAnswer && '✓'}
                            </span>
                            <span className="text-white">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Explanation:</p>
                        <p className="text-white">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>

            {/* Approval Section */}
            {!submission.isApproved && (
              <Card>
                <h2 className="text-xl font-bold text-white mb-4">Approve Submission</h2>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Remarks (Optional)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any remarks or feedback for the student..."
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none min-h-24"
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
                  <p className="text-gray-400">Approved on {new Date(submission.approvalDate).toLocaleDateString()}</p>
                  {submission.remarks && (
                    <p className="text-gray-300 mt-4">{submission.remarks}</p>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
