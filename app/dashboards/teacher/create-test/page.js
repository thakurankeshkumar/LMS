'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function CreateTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 30,
    passingMarks: 40,
    negativeMarking: false,
  });

  const [questions, setQuestions] = useState([]);
  const [jsonQuestionsInput, setJsonQuestionsInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect client-side after auth status is known
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session && session.user?.role !== 'teacher') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const response = await fetch('/api/users/config');
        const data = await response.json();

        if (!response.ok || !data.config) return;

        setTestData((current) => ({
          ...current,
          duration: data.config.defaultTestDuration ?? current.duration,
          passingMarks: data.config.defaultPassingPercentage ?? current.passingMarks,
          negativeMarking: data.config.defaultNegativeMarking ?? current.negativeMarking,
        }));
      } catch {
        // Defaults are optional; keep local fallbacks if unavailable.
      }
    };

    if (session?.user?.role === 'teacher') {
      fetchDefaults();
    }
  }, [session]);

  const addQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
  };

  const saveQuestion = () => {
    if (!currentQuestion.question) {
      setError('Please enter a question');
      return;
    }

    if (currentQuestion.options.some((opt) => !opt)) {
      setError('Please fill all options');
      return;
    }

    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion(null);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const parseQuestionsFromJson = (jsonText) => {
    if (!jsonText || !jsonText.trim()) {
      return null;
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('Invalid JSON format in pasted test');
    }

    const sourceQuestions = Array.isArray(parsed) ? parsed : parsed?.questions;

    if (!Array.isArray(sourceQuestions) || sourceQuestions.length === 0) {
      throw new Error('JSON must be an array or object with a non-empty questions array');
    }

    return sourceQuestions.map((q, index) => {
      if (!q || typeof q.question !== 'string' || !q.question.trim()) {
        throw new Error(`Question ${index + 1}: question is required`);
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${index + 1}: options must be an array of exactly 4 items`);
      }

      if (q.options.some((opt) => typeof opt !== 'string' || !opt.trim())) {
        throw new Error(`Question ${index + 1}: all options must be non-empty strings`);
      }

      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Question ${index + 1}: correctAnswer must be a number between 0 and 3`);
      }

      return {
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: q.correctAnswer,
        explanation: typeof q.explanation === 'string' ? q.explanation : '',
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let finalQuestions = questions;

    try {
      const parsedJsonQuestions = parseQuestionsFromJson(jsonQuestionsInput);
      if (parsedJsonQuestions) {
        finalQuestions = parsedJsonQuestions;
      }
    } catch (parseError) {
      setError(parseError.message || 'Invalid JSON questions format');
      setLoading(false);
      return;
    }

    if (!testData.title) {
      setError('Please enter test title');
      setLoading(false);
      return;
    }

    if (finalQuestions.length === 0) {
      setError('Please add at least one question');
      setLoading(false);
      return;
    }

    try {
      const totalMarks = finalQuestions.length * 10;
      const passingMarks = (totalMarks * testData.passingMarks) / 100;

      // Keep local state in sync when JSON import is used
      setQuestions(finalQuestions);

      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testData,
          questions: finalQuestions,
          totalMarks,
          passingMarks,
          negativeMarkingPercent: testData.negativeMarking ? 25 : 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboards/teacher/tests');
      } else {
        setError(data.message || 'Failed to create test');
      }
    } catch (err) {
      setError('Failed to create test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <Loading />;
  }

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="teacher" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Create Test</h1>
          <p className="text-slate-400">Create a new test with multiple questions</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          {/* Test Info */}
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Test Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">Test Title *</label>
                <Input
                  type="text"
                  placeholder="Enter test title"
                  value={testData.title}
                  onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Enter test description"
                  value={testData.description}
                  onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 text-slate-100 border border-slate-800 rounded-lg focus:border-blue-500 focus-ring min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2">Duration (Minutes) *</label>
                  <Input
                    type="number"
                    min="1"
                    max="480"
                    value={testData.duration}
                    onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Passing Marks (%) *</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={testData.passingMarks}
                    onChange={(e) => setTestData({ ...testData, passingMarks: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="inline-flex items-center text-slate-300">
                  <input
                    type="checkbox"
                    checked={testData.negativeMarking}
                    onChange={(e) => setTestData({ ...testData, negativeMarking: e.target.checked })}
                    className="mr-2"
                  />
                  Enable negative marking (25%)
                </label>
                <p className="text-slate-500 text-sm mt-1">Wrong answers will be penalized by 25% of each question&apos;s marks.</p>
              </div>
            </div>
          </Card>

          {/* Questions */}
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-100">Questions ({questions.length})</h2>
              {!currentQuestion && <Button onClick={addQuestion}>+ Add Question</Button>}
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 mb-2">Paste Questions JSON (Optional)</label>
              <textarea
                placeholder='Example: {"questions":[{"question":"2 + 2 = ?","options":["1","2","3","4"],"correctAnswer":3}]}'
                value={jsonQuestionsInput}
                onChange={(e) => setJsonQuestionsInput(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 text-slate-100 border border-slate-800 rounded-lg focus:border-blue-500 focus-ring min-h-28"
              />
              <p className="text-slate-500 text-sm mt-2">
                Supported formats: an array of questions OR an object with <code>questions</code> array.
                Each item needs: <code>question</code>, <code>options</code> (4 items), <code>correctAnswer</code> (0-3).
              </p>
            </div>

            {/* Question Form */}
            {currentQuestion && (
              <div className="bg-slate-950/55 p-6 rounded-lg mb-6">
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Question *</label>
                  <textarea
                    placeholder="Enter the question"
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900 text-slate-100 border border-slate-800 rounded-lg focus:border-blue-500 focus-ring min-h-20"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Options *</label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                          className="mt-2"
                        />
                        <Input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Explanation</label>
                  <textarea
                    placeholder="Optional: Explain the correct answer"
                    value={currentQuestion.explanation}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900 text-slate-100 border border-slate-800 rounded-lg focus:border-blue-500 focus-ring min-h-16"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCurrentQuestion(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={saveQuestion}>
                    Save Question
                  </Button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div key={index} className="p-3 bg-slate-950/55 rounded-lg flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-slate-100 font-semibold">Q{index + 1}. {q.question}</p>
                      <p className="text-slate-400 text-sm mt-1">Correct Answer: {q.options[q.correctAnswer]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-500 hover:text-red-400 ml-4"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Test'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
