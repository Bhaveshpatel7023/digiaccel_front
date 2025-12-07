'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthChoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testUrl = searchParams.get('testUrl');

  useEffect(() => {
    if (!testUrl) {
      router.push('/');
    }
  }, [testUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Your Test</h1>
          <p className="text-gray-600">
            Please login or create an account to take the test
          </p>
        </div>

        <div className="space-y-4">
          {/* Login Option */}
          <Link
            href={`/login?testUrl=${testUrl}`}
            className="block"
          >
            <div className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary-200 hover:border-primary-400">
              <div className="flex items-center">
                <div className="text-4xl mr-4">👤</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Already Have an Account?</h3>
                  <p className="text-gray-600 text-sm">Login to continue to your test</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Register Option */}
          <Link
            href={`/register?testUrl=${testUrl}`}
            className="block"
          >
            <div className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 hover:border-green-400">
              <div className="flex items-center">
                <div className="text-4xl mr-4">✍️</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">New User?</h3>
                  <p className="text-gray-600 text-sm">Create a free account to get started</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

