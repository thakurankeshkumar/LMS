'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Navbar({ role }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'GET' });
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-500">
          LMS
        </Link>

        <div className="flex gap-6 items-center">
          {role === 'student' && (
            <>
              <Link href="/dashboards/student" className="text-gray-300 hover:text-white">
                Dashboard
              </Link>
              <Link href="/dashboards/student/tests" className="text-gray-300 hover:text-white">
                Tests
              </Link>
              <Link href="/dashboards/student/results" className="text-gray-300 hover:text-white">
                Results
              </Link>
            </>
          )}

          {role === 'teacher' && (
            <>
              <Link href="/dashboards/teacher" className="text-gray-300 hover:text-white">
                Dashboard
              </Link>
              <Link href="/dashboards/teacher/tests" className="text-gray-300 hover:text-white">
                My Tests
              </Link>
              <Link href="/dashboards/teacher/submissions" className="text-gray-300 hover:text-white">
                Submissions
              </Link>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link href="/dashboards/admin" className="text-gray-300 hover:text-white">
                Dashboard
              </Link>
              <Link href="/dashboards/admin/users" className="text-gray-300 hover:text-white">
                Users
              </Link>
              <Link href="/dashboards/admin/settings" className="text-gray-300 hover:text-white">
                Settings
              </Link>
            </>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
