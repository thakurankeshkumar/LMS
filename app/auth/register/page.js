'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';
import Alert from '@/app/components/Alert';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [publicSignup, setPublicSignup] = useState(true);
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
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicSignup) {
      setError('Registration is currently disabled');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
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
        <h1 className="text-center text-3xl font-bold text-slate-100">Create account</h1>
        <p className="mb-6 mt-2 text-center text-sm text-slate-400">
          {publicSignup ? 'Students can register directly. Staff accounts can be created by admins.' : 'Public signup is currently disabled.'}
        </p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        {signupNotice && <Alert type="info" message={signupNotice} />}

        {!configLoading && !publicSignup && (
          <div className="mb-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
            Registration is closed right now. Please ask an administrator to create your account.
            {supportEmail && <span> Contact {supportEmail} for access.</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Name</label>
            <Input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!publicSignup || configLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={!publicSignup || configLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={!publicSignup || configLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={!publicSignup || configLoading}
            />
          </div>

          <Button type="submit" disabled={loading || configLoading || !publicSignup} className="w-full">
            {configLoading ? 'Checking signup...' : loading ? 'Signing up...' : publicSignup ? 'Sign Up' : 'Signup Disabled'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-sky-300 hover:text-sky-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
