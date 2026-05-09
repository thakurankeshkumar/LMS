'use client';

import { useEffect, useState } from 'react';
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
  const [publicSignup, setPublicSignup] = useState(false);
  const [signupNotice, setSignupNotice] = useState('');
  const [supportEmail, setSupportEmail] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/users/config');
        const data = await response.json();
        if (response.ok) {
          setPublicSignup(data.config?.publicSignup ?? true);
          setSignupNotice(data.config?.signupNotice || '');
          setSupportEmail(data.config?.supportEmail || '');
        }
      } catch {
        setPublicSignup(false);
      }
    };

    fetchConfig();
  }, []);

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
        setError(result.error.includes('deactivated') ? 'Your account is blocked. Contact an administrator.' : 'Invalid email or password');
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
    <div className="min-h-screen app-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">
        <Link href="/" className="mx-auto mb-6 flex size-12 items-center justify-center rounded-md bg-sky-400 text-sm font-black text-slate-950">
          LMS
        </Link>
        <h1 className="text-center text-3xl font-bold text-slate-100">Welcome back</h1>
        <p className="mb-6 mt-2 text-center text-sm text-slate-400">Sign in to continue to your role dashboard.</p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {publicSignup ? (
          <p className="mt-5 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-sky-300 hover:text-sky-200">
              Sign up
            </Link>
          </p>
        ) : (
          <p className="mt-5 rounded-lg border border-slate-800 bg-slate-950/55 px-4 py-3 text-center text-sm text-slate-400">
            Public signup is currently disabled.
            {supportEmail ? ` Contact ${supportEmail} for access.` : ' Please contact an administrator for access.'}
          </p>
        )}

        {signupNotice && (
          <div className="mt-4 rounded-lg border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm leading-6 text-sky-100">
            {signupNotice}
          </div>
        )}

      </div>
    </div>
  );
}
