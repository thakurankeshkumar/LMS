'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';
import Alert from '@/app/components/Alert';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      const sessionResponse = await fetch('/api/auth/session');
      const session = await sessionResponse.json();
      const role = session?.user?.role;

      if (role === 'student') {
        router.replace('/dashboards/student');
      } else if (role === 'teacher') {
        router.replace('/dashboards/teacher');
      } else if (role === 'admin') {
        router.replace('/dashboards/admin');
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">LMS Login</h1>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-500 hover:text-blue-400">
            Sign up
          </Link>
        </p>

        <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Demo Credentials:</p>
          <p className="text-gray-500 text-xs">
            Student: student@test.com / password123
            <br />
            Teacher: teacher@test.com / password123
            <br />
            Admin: admin@test.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
