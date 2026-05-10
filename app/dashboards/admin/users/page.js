'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import Modal from '@/app/components/Modal';
import Card from '@/app/components/Card';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';
import { useConfirmDialog, useToast } from '@/app/components/Feedback';
import { Badge, EmptyState, PageHeader } from '@/app/components/DashboardUI';

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
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

    if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsers();
    }
  }, [session]);

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers([...users, data.user]);
        setFormData({ name: '', email: '', password: '', role: 'student' });
        setShowModal(false);
        notify('User added successfully');
      } else {
        setError(data.message || 'Failed to add user');
      }
    } catch (err) {
      setError('Failed to add user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find((item) => item._id === userId);
    const shouldDelete = await openConfirm({
      title: 'Delete user?',
      message: `This will permanently remove ${user?.name || 'this user'} and their access to the LMS.`,
      confirmLabel: 'Delete user',
      variant: 'danger',
    });
    if (!shouldDelete) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userId));
        notify('User deleted successfully');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const nextActiveState = !targetUser.isActive;
    const shouldUpdate = await openConfirm({
      title: nextActiveState ? 'Unblock user?' : 'Block user?',
      message: nextActiveState
        ? `${targetUser.name} will regain LMS access.`
        : `${targetUser.name} will be blocked from dashboards, tests, submissions, and LMS operations.`,
      confirmLabel: nextActiveState ? 'Unblock user' : 'Block user',
      variant: nextActiveState ? 'success' : 'warning',
    });
    if (!shouldUpdate) return;

    try {
      const response = await fetch(`/api/users/${targetUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActiveState }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.map((user) => (user._id === targetUser._id ? data.user : user)));
        notify(`User ${nextActiveState ? 'unblocked' : 'blocked'} successfully`);
      } else {
        setError(data.message || 'Failed to update user status');
      }
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    }
  };

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  const currentUserId = session?.user?.id;
  const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="admin" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow="Admin control"
          title="Manage Users"
          description="Create staff accounts, block or unblock access, review role coverage, and remove users who should no longer exist."
          action={<Button onClick={() => setShowModal(true)}>+ Add User</Button>}
        />

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {safeUsers.length === 0 ? (
          <EmptyState title="No users found" description="Add a student, teacher, or admin account to begin operating the LMS." action={<Button onClick={() => setShowModal(true)}>Add User</Button>} />
        ) : (
        <Card className="p-0">
          <div className="table-scroll">
          <table className="w-full min-w-195">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/55">
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Name</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Email</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Joined</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeUsers.map((user, index) => (
                <tr key={user?._id || `user-${index}`} className="border-b border-slate-800 hover:bg-slate-950/55">
                  <td className="py-4 px-4 text-slate-100">{user?.name || 'Unknown User'}</td>
                  <td className="py-4 px-4 text-slate-100">{user?.email || 'No email'}</td>
                  <td className="py-4 px-4">
                    <Badge tone={user?.role === 'admin' ? 'blue' : user?.role === 'teacher' ? 'teal' : 'slate'}>{user?.role || 'unknown'}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge tone={user?.isActive ? 'green' : 'red'}>{user?.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggleUserStatus(user)}
                      disabled={!user?._id || user._id === currentUserId}
                      className={`rounded-md px-3 py-2 text-sm font-semibold focus-ring disabled:cursor-not-allowed disabled:opacity-45 ${
                        user?.isActive
                          ? 'text-amber-200 hover:bg-amber-400/10'
                          : 'text-emerald-200 hover:bg-emerald-400/10'
                      }`}
                    >
                      {user?.isActive ? 'Block' : 'Unblock'}
                    </button>
                    <button
                      onClick={() => user?._id && handleDeleteUser(user._id)}
                      disabled={!user?._id || user._id === currentUserId}
                      className="rounded-md px-3 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-400/10 focus-ring disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Delete
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Name</label>
              <Input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus-ring"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add User
              </Button>
            </div>
          </form>
        </Modal>
        <ConfirmDialog />
        <Toast />
      </main>
    </div>
  );
}
