'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { testAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Test {
  _id: string;
  uniqueUrl: string;
  status: string;
  score: number;
  attempts: any[];
  userId: {
    name: string;
    email: string;
  };
  createdAt: string;
  completedAt?: string;
  completionReason?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && !user.isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const handleGenerateUrl = async () => {
    setIsGenerating(true);
    try {
      const response = await testAPI.generateTestUrl();
      setGeneratedUrl(response.data.testUrl);
      toast.success('Test URL generated successfully!');
    } catch (error: any) {
      toast.error('Failed to generate test URL');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast.success('URL copied to clipboard!');
    }
  };

  const fetchAllTests = async () => {
    setIsLoadingTests(true);
    try {
      const response = await testAPI.getAllTests();
      setTests(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch tests');
    } finally {
      setIsLoadingTests(false);
    }
  };

  if (!isAuthenticated || !user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin: {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Control Panel</h2>
          <p className="text-gray-600">Manage questions, tests, and view results</p>
        </div>

        {/* Generate Test URL */}
        <div className="mb-8 card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <h3 className="text-xl font-bold mb-4">Generate Test URL</h3>
          <p className="text-gray-700 mb-4">
            Create a unique test URL to share with students. They'll register using this URL and take the test.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleGenerateUrl}
              disabled={isGenerating}
              className="btn btn-primary"
            >
              {isGenerating ? 'Generating...' : 'Generate New URL'}
            </button>
            {generatedUrl && (
              <button onClick={handleCopyUrl} className="btn btn-secondary">
                📋 Copy URL
              </button>
            )}
          </div>
          {generatedUrl && (
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-primary-300">
              <p className="text-sm text-gray-600 mb-2">Share this URL with your student:</p>
              <p className="font-mono text-sm break-all text-primary-700">{generatedUrl}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Question Management</h3>
            <p className="text-gray-600 mb-4">Create, edit, and delete questions</p>
            <p className="text-sm text-gray-500 mb-4">
              Use the API endpoints via Postman to manage questions
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">POST /questions</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">GET /questions</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">PUT /questions/:id</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">DELETE /questions/:id</p>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Test Results</h3>
            <p className="text-gray-600 mb-4">View all test results and analytics</p>
            <button
              onClick={fetchAllTests}
              disabled={isLoadingTests}
              className="btn btn-secondary w-full mb-4"
            >
              {isLoadingTests ? 'Loading...' : 'Load All Tests'}
            </button>
            <div className="space-y-2 text-sm">
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">GET /tests</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">GET /tests/:id</p>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">User Management</h3>
            <p className="text-gray-600 mb-4">Monitor student progress</p>
            <p className="text-sm text-gray-500">
              View user test history and performance metrics
            </p>
          </div>
        </div>

        {/* Test Results Table */}
        {tests.length > 0 && (
          <div className="mt-12 card">
            <h3 className="text-xl font-bold mb-6">Recent Test Results</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tests.map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{test.userId?.name}</div>
                        <div className="text-sm text-gray-500">{test.userId?.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            test.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {test.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.score}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.attempts?.length || 0}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {test.completionReason || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="card bg-primary-50 border-primary-200">
            <h3 className="text-xl font-bold mb-4">API Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-1">Base URL:</p>
                <p className="font-mono bg-white p-2 rounded">
                  {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Authorization:</p>
                <p className="font-mono bg-white p-2 rounded text-xs">
                  Bearer YOUR_JWT_TOKEN
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <h3 className="text-xl font-bold mb-4">Database Seed</h3>
            <p className="text-gray-700 mb-4">
              The database contains 500 pre-seeded questions across all difficulty levels (1-10).
            </p>
            <p className="text-sm text-gray-600">
              To reseed the database, run: <code className="bg-white px-2 py-1 rounded">npm run seed</code> in the backend directory.
            </p>
          </div>
        </div>

        <div className="mt-12 card">
          <h3 className="text-xl font-bold mb-4">Quick Start Guide</h3>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-semibold">Use Postman to manage questions</p>
                <p className="text-sm text-gray-600">
                  Include your JWT token in the Authorization header for all admin endpoints
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-semibold">Generate unique test URLs</p>
                <p className="text-sm text-gray-600">
                  Each user gets a unique test URL which they can use to access and take the test
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-semibold">Monitor test results</p>
                <p className="text-sm text-gray-600">
                  View detailed test results including all attempts, scores, and completion reasons
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

