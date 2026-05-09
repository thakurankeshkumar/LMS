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

export default function EditTestPage({ params }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 30,
    passingMarks: 40,
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session && session.user?.role !== 'teacher') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/tests/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load test');
          return;
        }

        const test = data.test;

        setTestData({
          title: test.title || '',
          description: test.description || '',
          duration: test.duration || 30,
          passingMarks:
            test.totalMarks > 0
              ? Math.round((test.passingMarks / test.totalMarks) * 100)
              : 40,
        });
        setQuestions(test.questions || []);
      } catch (err) {
        setError('Failed to load test');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTest();
    }
  }, [session, id]);

  const addQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
    setEditingQuestionIndex(null);
  };

  const editQuestion = (index) => {
    setCurrentQuestion({ ...questions[index] });
    setEditingQuestionIndex(index);
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

    if (editingQuestionIndex === null) {
      setQuestions([...questions, currentQuestion]);
    } else {
      setQuestions(questions.map((question, index) => (index === editingQuestionIndex ? currentQuestion : question)));
    }

    setCurrentQuestion(null);
    setEditingQuestionIndex(null);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, questionIndex) => questionIndex !== index));

    if (editingQuestionIndex === index) {
      setCurrentQuestion(null);
      setEditingQuestionIndex(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!testData.title) {
      setError('Please enter test title');
      setSaving(false);
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      setSaving(false);
      return;
    }

    try {
      const totalMarks = questions.length * 10;
      const passingMarks = (totalMarks * testData.passingMarks) / 100;

      const response = await fetch(`/api/tests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testData,
          questions,
          totalMarks,
          passingMarks,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboards/teacher/tests');
      } else {
        setError(data.message || 'Failed to update test');
      }
    } catch (err) {
      setError('Failed to update test');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="teacher" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Test</h1>
          <p className="text-gray-400">Update the test details and questions</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Test Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Test Title *</label>
                <Input
                  type="text"
                  placeholder="Enter test title"
                  value={testData.title}
                  onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  placeholder="Enter test description"
                  value={testData.description}
                  onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Duration (Minutes) *</label>
                  <Input
                    type="number"
                    min="1"
                    max="480"
                    value={testData.duration}
                    onChange={(e) =>
                      setTestData({ ...testData, duration: parseInt(e.target.value, 10) })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Passing Marks (%) *</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={testData.passingMarks}
                    onChange={(e) =>
                      setTestData({ ...testData, passingMarks: parseInt(e.target.value, 10) })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Questions ({questions.length})</h2>
              {!currentQuestion && <Button type="button" onClick={addQuestion}>+ Add Question</Button>}
            </div>

            {currentQuestion && (
              <div className="bg-gray-700 p-6 rounded-lg mb-6">
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Question *</label>
                  <textarea
                    placeholder="Enter the question"
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none min-h-20"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Options *</label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() =>
                            setCurrentQuestion({ ...currentQuestion, correctAnswer: index })
                          }
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
                  <label className="block text-gray-300 mb-2">Explanation</label>
                  <textarea
                    placeholder="Optional: Explain the correct answer"
                    value={currentQuestion.explanation}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none min-h-16"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setCurrentQuestion(null);
                      setEditingQuestionIndex(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={saveQuestion}>
                    {editingQuestionIndex === null ? 'Save Question' : 'Update Question'}
                  </Button>
                </div>
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        Q{index + 1}. {question.question}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Correct Answer: {question.options[question.correctAnswer]}
                      </p>
                    </div>
                    <div className="flex gap-3 ml-4">
                      <button
                        type="button"
                        onClick={() => editQuestion(index)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboards/teacher/tests')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Update Test'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}