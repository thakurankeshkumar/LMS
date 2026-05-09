'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Loading from '@/app/components/Loading';
import Alert from '@/app/components/Alert';

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/users/config');
        const data = await response.json();
        setConfig(data.config || { publicSignup: true });
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchConfig();
    }
  }, [session]);

  const handleSaveConfig = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicSignup: config.publicSignup }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfig(data.config);
        setSuccess('Settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings');
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
      <Navbar role="admin" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure system-wide settings</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        {config && (
          <Card>
            <h2 className="text-2xl font-bold text-white mb-6">Registration Settings</h2>

            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Public Signup</h3>
                  <p className="text-gray-400 text-sm">
                    {config.publicSignup
                      ? 'Anyone can register for an account'
                      : 'Only admins can create new user accounts'}
                  </p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, publicSignup: !config.publicSignup })}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    config.publicSignup ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      config.publicSignup ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  ></span>
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSaveConfig}
                disabled={saving}
                className="px-6"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        )}

        {/* System Info */}
        <Card className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">System Information</h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">LMS Version</span>
              <span className="text-white font-semibold">1.0.0</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Database</span>
              <span className="text-white font-semibold">MongoDB Atlas</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Node Environment</span>
              <span className="text-white font-semibold">Production</span>
            </div>

            <div className="flex justify-between py-3">
              <span className="text-gray-400">API Documentation</span>
              <a href="#" className="text-blue-500 hover:text-blue-400">
                View Docs
              </a>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
