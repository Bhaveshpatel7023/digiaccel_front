'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const testUrl = searchParams.get('testUrl');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Add testUrl to login request if present
      const loginData = testUrl 
        ? { ...formData, testUrl } 
        : formData;
        
      const response = await authAPI.login(loginData);
      const { access_token, user, tests, testId: returnedTestId } = response.data;

      dispatch(setCredentials({ user, token: access_token }));
      
      toast.success('Login successful!');
      
      // Redirect based on role or test URL
      if (user.isAdmin) {
        router.push('/admin');
      } else if (testUrl) {
        // User logged in from test URL - backend creates/finds test automatically
        const userTest = tests?.find((t: any) => t.uniqueUrl === testUrl);
        
        if (userTest || returnedTestId) {
          // Store test info for quick access
          const testIdToStore = userTest?.testId || returnedTestId;
          localStorage.setItem('pendingTestId', testIdToStore);
          localStorage.setItem('pendingTestUrl', testUrl);
          router.push(`/test/${testUrl}`);
        } else {
          // Shouldn't happen, but fallback
          router.push(`/test/${testUrl}`);
        }
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            {testUrl ? 'Sign in to continue to your test' : 'Sign in to continue to LMS'}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href={testUrl ? `/register?testUrl=${testUrl}` : '/register'} 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <p>Admin: admin@lms.com / admin123</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

