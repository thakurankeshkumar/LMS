import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-500">
            LMS
          </Link>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Learning Management System
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            Create, assign, and grade tests effortlessly
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/auth/register"
              className="border border-gray-500 text-white px-8 py-3 rounded-lg text-lg hover:border-gray-300 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-3">For Students</h3>
            <p className="text-gray-400">
              Take tests with timers, view your results, and track your progress
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-3">For Teachers</h3>
            <p className="text-gray-400">
              Create MCQ tests, assign to students, and approve their results
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-3">For Admins</h3>
            <p className="text-gray-400">
              Manage users, monitor submissions, and configure system settings
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-16 bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <span className="text-green-500 text-2xl">✓</span>
              <div>
                <h4 className="text-white font-semibold">Multiple Choice Questions</h4>
                <p className="text-gray-400">Create tests with 4 options per question</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-green-500 text-2xl">✓</span>
              <div>
                <h4 className="text-white font-semibold">Timer-Based Tests</h4>
                <p className="text-gray-400">Configurable time limits with auto-submit</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-green-500 text-2xl">✓</span>
              <div>
                <h4 className="text-white font-semibold">Instant Results</h4>
                <p className="text-gray-400">Get immediate feedback on performance</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-green-500 text-2xl">✓</span>
              <div>
                <h4 className="text-white font-semibold">Result Approval</h4>
                <p className="text-gray-400">Teachers can review and approve submissions</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-green-500 text-2xl">✓</span>
              <div>
                <h4 className="text-white font-semibold">Analytics Dashboard</h4>
                <p className="text-gray-400">Track performance and system statistics</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-green-500 text-2xl">✓</span>
              <div>
                <h4 className="text-white font-semibold">Responsive Design</h4>
                <p className="text-gray-400">Works seamlessly on desktop and mobile</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">
          <p>&copy; 2026 Learning Management System. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
