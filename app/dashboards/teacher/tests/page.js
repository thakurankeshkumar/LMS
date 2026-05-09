'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import TestCard from '@/app/components/TestCard';
import Button from '@/app/components/Button';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';
import Modal from '@/app/components/Modal';
import { useConfirmDialog, useToast } from '@/app/components/Feedback';
import { EmptyState, PageHeader } from '@/app/components/DashboardUI';

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
  const { notify, Toast } = useToast();
  const { confirm: openConfirm, ConfirmDialog } = useConfirmDialog();

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
    const shouldDelete = await openConfirm({
      title: 'Delete test?',
      message: 'This removes the test for the teacher dashboard and cannot be undone.',
      confirmLabel: 'Delete test',
      variant: 'danger',
    });
    if (!shouldDelete) return;

    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTests(tests.filter((t) => t._id !== testId));
        notify('Test deleted successfully');
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
        notify(`Test ${updatedTest.test.isPublished ? 'published' : 'unpublished'} successfully`);
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
        notify('Test assigned successfully');
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
    <div className="min-h-screen app-surface">
      <Navbar role="teacher" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow="Assessment library"
          title="My Tests"
          description="Manage drafts, publish assessments, assign students, and keep the test catalog ready for learners."
          action={<Button onClick={() => router.push('/dashboards/teacher/create-test')}>
            + Create Test
          </Button>}
        />

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {tests.length === 0 ? (
          <EmptyState
            title="No tests created yet"
            description="Create the first assessment, add questions, then publish and assign it to students."
            action={<Button onClick={() => router.push('/dashboards/teacher/create-test')}>
              Create Your First Test
            </Button>}
          />
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
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedStudents([]);
        }}
        title="Assign Test to Students"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedStudents([]);
              }}
              disabled={assignLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignStudents} disabled={assignLoading}>
              {assignLoading ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        }
      >
            <div className="mb-4 max-h-60 space-y-2 overflow-y-auto rounded-lg border border-slate-800 p-3">
              {students.length === 0 ? (
                <p className="text-slate-400 text-sm">No students found</p>
              ) : (
                students.map((student) => (
                  <label key={student._id} className="flex cursor-pointer items-start gap-3 rounded-md p-3 hover:bg-slate-950/55">
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
                      className="mt-1 size-4"
                    />
                    <span className="text-sm text-slate-100">
                      <span className="block font-semibold">{student.name}</span>
                      <span className="text-slate-400">{student.email}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-sm leading-6 text-slate-400">
              Selected students will see this test in their assigned test queue.
            </p>
      </Modal>
      <ConfirmDialog />
      <Toast />
    </div>
  );
}
