'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import TestCard from '@/app/components/TestCard';
import Button from '@/app/components/Button';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function TeacherTests() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

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
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/tests');
        const data = await response.json();
        setTests(data.tests || []);
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

  const handleDelete = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTests(tests.filter((t) => t._id !== testId));
        alert('Test deleted successfully');
      } else {
        setError('Failed to delete test');
      }
    } catch (err) {
      setError('Failed to delete test');
      console.error(err);
    }
  };

  const handlePublish = async (testId) => {
    try {
      const test = tests.find((t) => t._id === testId);
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !test.isPublished,
        }),
      });

      if (response.ok) {
        const updatedTest = await response.json();
        setTests(tests.map((t) => (t._id === testId ? updatedTest.test : t)));
        alert(`Test ${updatedTest.test.isPublished ? 'published' : 'unpublished'} successfully`);
      } else {
        setError('Failed to update test');
      }
    } catch (err) {
      setError('Failed to update test');
      console.error(err);
    }
  };

  const handleAssignClick = async (testId) => {
    setSelectedTestId(testId);
    setShowAssignModal(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      const userList = Array.isArray(data.users) ? data.users : [];
      setStudents(userList.filter((u) => u.role === 'student'));
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setAssignLoading(true);
    try {
      const response = await fetch(`/api/tests/${selectedTestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTests(tests.map((t) => (t._id === selectedTestId ? data.test : t)));
        setShowAssignModal(false);
        setSelectedStudents([]);
        alert('Test assigned successfully');
      } else {
        setError('Failed to assign test');
      }
    } catch (err) {
      setError('Failed to assign test');
      console.error(err);
    } finally {
      setAssignLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="teacher" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Tests</h1>
            <p className="text-gray-400">Create, manage, and publish your tests</p>
          </div>
          <Button onClick={() => router.push('/dashboards/teacher/create-test')}>
            + Create Test
          </Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No tests created yet</p>
            <Button onClick={() => router.push('/dashboards/teacher/create-test')}>
              Create Your First Test
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                onEdit={(testId) => router.push(`/dashboards/teacher/edit-test/${testId}`)}
                onDelete={handleDelete}
                onPublish={handlePublish}
                onAssign={handleAssignClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full max-h-96 overflow-y-auto border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Assign Test to Students</h2>
            
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto border border-gray-700 rounded p-3">
              {students.length === 0 ? (
                <p className="text-gray-400 text-sm">No students found</p>
              ) : (
                students.map((student) => (
                  <label key={student._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student._id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter((id) => id !== student._id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-white text-sm">{student.name} ({student.email})</span>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedStudents([]);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                disabled={assignLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStudents}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                disabled={assignLoading}
              >
                {assignLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
