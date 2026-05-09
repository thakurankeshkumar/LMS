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
import { Badge, PageHeader } from '@/app/components/DashboardUI';

const defaultConfig = {
  publicSignup: true,
  maintenanceMode: false,
  signupNotice: '',
  supportEmail: '',
  defaultTestDuration: 30,
  defaultPassingPercentage: 40,
  defaultNegativeMarking: false,
};

function ToggleRow({ title, description, checked, onChange, disabled, tone = 'sky' }) {
  const activeColor = tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-400' : 'bg-sky-400';

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/55 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={onChange}
          disabled={disabled}
          aria-pressed={checked}
          className={`relative inline-flex h-8 w-16 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${checked ? activeColor : 'bg-slate-800'}`}
        >
          <span
            className={`inline-block size-6 transform rounded-full bg-slate-950 shadow transition-transform ${
              checked ? 'translate-x-9' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
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
        setConfig({ ...defaultConfig, ...(data.config || {}) });
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchConfig();
  }, [session]);

  const saveConfig = async (nextConfig) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      });

      const data = await response.json();

      if (response.ok) {
        setConfig({ ...defaultConfig, ...data.config });
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

  const toggleSetting = async (key) => {
    const nextConfig = { ...config, [key]: !config[key] };
    setConfig(nextConfig);
    await saveConfig(nextConfig);
  };

  if (status === 'loading' || loading) return <Loading />;

  return (
    <div className="min-h-screen app-surface">
      <Navbar role="admin" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow="System controls"
          title="Settings"
          description="Manage registration, access mode, support messaging, and teacher test defaults from one place."
          action={<Badge tone={config.maintenanceMode ? 'amber' : 'green'}>{config.maintenanceMode ? 'Maintenance on' : 'Operational'}</Badge>}
        />

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card>
              <h2 className="mb-5 text-2xl font-bold text-slate-100">Access Controls</h2>
              <div className="space-y-4">
                <ToggleRow
                  title="Public Signup"
                  description={config.publicSignup ? 'Students can create their own accounts from the login page.' : 'Signup links are hidden and only admins can create accounts.'}
                  checked={config.publicSignup}
                  onChange={() => toggleSetting('publicSignup')}
                  disabled={saving}
                  tone="emerald"
                />
                <ToggleRow
                  title="Maintenance Mode"
                  description="When enabled, non-admin users are blocked from LMS operations while admins can continue working."
                  checked={config.maintenanceMode}
                  onChange={() => toggleSetting('maintenanceMode')}
                  disabled={saving}
                  tone="amber"
                />
              </div>
            </Card>

            <Card>
              <h2 className="mb-5 text-2xl font-bold text-slate-100">System Information</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-800 py-3">
                  <span className="text-slate-400">LMS Version</span>
                  <span className="font-semibold text-slate-100">1.0.0</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-800 py-3">
                  <span className="text-slate-400">Database</span>
                  <span className="font-semibold text-slate-100">MongoDB Atlas</span>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <span className="text-slate-400">Runtime</span>
                  <span className="font-semibold text-slate-100">Next.js 16</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="mb-5 text-2xl font-bold text-slate-100">Signup Messaging</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Support Email</label>
                  <Input
                    type="email"
                    placeholder="support@example.com"
                    value={config.supportEmail}
                    onChange={(event) => setConfig({ ...config, supportEmail: event.target.value })}
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">Shown on login/register when signup is disabled.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Signup Notice</label>
                  <textarea
                    value={config.signupNotice}
                    onChange={(event) => setConfig({ ...config, signupNotice: event.target.value })}
                    maxLength={240}
                    placeholder="Example: New student registrations are reviewed weekly."
                    className="min-h-28 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus-ring"
                  />
                  <p className="mt-2 text-xs text-slate-500">{config.signupNotice.length}/240 characters</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="mb-5 text-2xl font-bold text-slate-100">Teacher Test Defaults</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Default Duration</label>
                  <Input
                    type="number"
                    min="1"
                    max="480"
                    value={config.defaultTestDuration}
                    onChange={(event) => setConfig({ ...config, defaultTestDuration: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Default Passing %</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.defaultPassingPercentage}
                    onChange={(event) => setConfig({ ...config, defaultPassingPercentage: Number(event.target.value) })}
                  />
                </div>
              </div>
              <div className="mt-4">
                <ToggleRow
                  title="Default Negative Marking"
                  description="New teacher tests will start with 25% wrong-answer penalty enabled."
                  checked={config.defaultNegativeMarking}
                  onChange={() => setConfig({ ...config, defaultNegativeMarking: !config.defaultNegativeMarking })}
                  disabled={saving}
                  tone="sky"
                />
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => saveConfig(config)} disabled={saving} className="px-6">
                {saving ? 'Saving...' : 'Save All Settings'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
