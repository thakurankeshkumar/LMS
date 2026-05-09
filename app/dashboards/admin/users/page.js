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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
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
        alert('User added successfully');
      } else {
        setError(data.message || 'Failed to add user');
      }
    } catch (err) {
      setError('Failed to add user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userId));
        alert('User deleted successfully');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar role="admin" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Users</h1>
            <p className="text-gray-400">Add, edit, and delete users</p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Add User</Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-gray-400">Name</th>
                <th className="text-left py-4 px-4 text-gray-400">Email</th>
                <th className="text-left py-4 px-4 text-gray-400">Role</th>
                <th className="text-left py-4 px-4 text-gray-400">Status</th>
                <th className="text-left py-4 px-4 text-gray-400">Joined</th>
                <th className="text-left py-4 px-4 text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="py-4 px-4 text-white">{user.name}</td>
                  <td className="py-4 px-4 text-white">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 text-sm font-semibold capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        user.isActive
                          ? 'bg-green-900 text-green-200'
                          : 'bg-red-900 text-red-200'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Name</label>
              <Input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
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
      </main>
    </div>
  );
}
