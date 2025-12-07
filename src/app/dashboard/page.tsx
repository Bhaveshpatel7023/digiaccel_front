'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { testAPI } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface Test {
  _id: string;
  uniqueUrl: string;
  status: string;
  score: number;
  attempts: any[];
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Wait for auth to load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.isAdmin) {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router, isCheckingAuth]);

  useEffect(() => {
    const fetchTests = async () => {
      if (!isAuthenticated || user?.isAdmin) return;
      
      try {
        const response = await testAPI.getMyTests();
        setTests(response.data);
      } catch (error: any) {
        console.error('Failed to fetch tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !user || user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">LMS Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</h2>
          <p className="text-gray-600">Manage your tests and track your progress</p>
        </div>

        {/* My Tests */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">My Tests</h3>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : tests.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <div key={test._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">
                      {test.status === 'completed' ? '✅' : '📝'}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        test.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {test.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <h4 className="font-bold mb-2">Adaptive Test</h4>
                  <div className="space-y-2 mb-4">
                    {test.status === 'completed' && (
                      <>
                        <p className="text-sm text-gray-600">
                          Score: <span className="font-semibold text-primary-600">{test.score}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Questions: {test.attempts?.length || 0}
                        </p>
                      </>
                    )}
                    {test.status === 'in-progress' && test.attempts?.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Progress: {test.attempts.length}/20 questions
                      </p>
                    )}
                  </div>
                  {test.status === 'in-progress' && (
                    <Link
                      href={`/test/${test.uniqueUrl}`}
                      className="btn btn-primary w-full text-center"
                    >
                      {test.attempts?.length > 0 ? 'Continue Test' : 'Start Test'}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-gray-50 text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">No Tests Available</h3>
              <p className="text-gray-600">
                You don't have any tests assigned yet. Your instructor will provide you with test URLs.
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Your Results</h3>
            <p className="text-gray-600 mb-4">View your test scores and performance</p>
            <p className="text-sm text-gray-500">
              Track your progress over time
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Performance</h3>
            <p className="text-gray-600 mb-4">Analyze your strengths and weaknesses</p>
            <p className="text-sm text-gray-500">
              Get insights on areas to improve
            </p>
          </div>
        </div>

        <div className="mt-12 card bg-primary-50 border-primary-200">
          <h3 className="text-xl font-bold mb-4">How to Take a Test</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                1
              </span>
              <span>You will receive a unique test URL from your instructor</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                2
              </span>
              <span>Click the URL or paste it in your browser</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                3
              </span>
              <span>Register or login if you haven't already</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                4
              </span>
              <span>Start the test and answer questions to the best of your ability</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

