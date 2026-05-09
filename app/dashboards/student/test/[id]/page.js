'use client';

import { use, useCallback, useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Button from '@/app/components/Button';
import Alert from '@/app/components/Alert';
import Loading from '@/app/components/Loading';
import { shuffleArray, formatTime } from '@/utils/helpers';

export default function TestPage({ params }) {
  const { id: testId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const submitTestRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (session?.user?.role !== 'student') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        // First check if student already submitted this test
        const submissionsResponse = await fetch('/api/submissions');
        const submissionsData = await submissionsResponse.json();
        
        const alreadySubmitted = submissionsData.submissions?.some(
          (sub) => sub.testId._id === testId || sub.testId === testId
        );
        
        if (alreadySubmitted) {
          setError('You have already taken this test. You cannot attempt it again.');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/tests/${testId}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.message || 'Failed to load test');
          return;
        }

        // Shuffle questions
        const shuffledQuestions = shuffleArray(data.test.questions);
        data.test.questions = shuffledQuestions;

        setTest(data.test);
        setTimeLeft(data.test.duration * 60);
        setAnswers(new Array(data.test.questions.length).fill(null));
      } catch (err) {
        setError('Failed to load test');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session && testId) {
      fetchTest();
    }
  }, [session, testId]);

  // Timer effect
  useEffect(() => {
    if (test && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (test && timeLeft === 0) {
      submitTestRef.current?.();
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, test]);

  // Tab visibility warning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fullscreen requirement
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const enterFullscreen = async () => {
    try {
      const fullscreenElement = containerRef.current || document.documentElement;

      if (fullscreenElement.requestFullscreen) {
        await fullscreenElement.requestFullscreen();
      }
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { selectedOption: optionIndex };
    setAnswers(newAnswers);
  };

  const submitTest = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          answers,
          timeTaken: test.duration * 60 - timeLeft,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboards/student/result/${data.submission._id}`);
      } else {
        setError(data.message || 'Failed to submit test');
      }
    } catch (err) {
      setError('Failed to submit test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [answers, router, test, testId, timeLeft]);

  useEffect(() => {
    submitTestRef.current = submitTest;
  }, [submitTest]);

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar role="student" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Alert type="error" message={error} />
          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboards/student/tests')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Tests
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!test) {
    return <Loading />;
  }

  if (!isFullscreen) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Fullscreen Required</h2>
          <p className="text-gray-400 mb-6">
            This test must be taken in fullscreen mode for security reasons.
          </p>
          <Button onClick={enterFullscreen} className="w-full">
            Enter Fullscreen
          </Button>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== null;

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 p-4">
      {tabWarning && (
        <Alert type="warning" message="⚠️ Warning: Tab switching is not allowed during the test!" />
      )}

      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{test.title}</h1>
            <p className="text-gray-400">Question {currentQuestion + 1} of {test.questions.length}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeLeft > 60 ? 'text-green-500' : timeLeft > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-400 text-sm">Time Remaining</p>
          </div>
        </div>
        <div className="mt-4 bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / test.questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-6">{question.question}</h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                answers[currentQuestion]?.selectedOption === index
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion]?.selectedOption === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-500'
                  }`}
                >
                  {answers[currentQuestion]?.selectedOption === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-white">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-between">
        <Button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          variant="secondary"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {Array.from({ length: test.questions.length }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`w-10 h-10 rounded-lg border transition-colors ${
                i === currentQuestion
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : answers[i] !== null
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQuestion === test.questions.length - 1 ? (
          <Button
            onClick={() => setShowConfirm(true)}
            variant="success"
          >
            Submit Test
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(Math.min(test.questions.length - 1, currentQuestion + 1))}
            variant="primary"
          >
            Next
          </Button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Submit Test?</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to submit your test? You cannot change your answers after submission.</p>
            <div className="flex gap-4">
              <Button onClick={() => setShowConfirm(false)} variant="secondary" className="flex-1">
                Cancel
              </Button>
              <Button onClick={submitTest} variant="success" className="flex-1" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
