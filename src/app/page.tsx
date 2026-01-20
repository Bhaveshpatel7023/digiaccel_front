'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isAdmin) {
        router.push('/admin');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Welcome to LMS
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Adaptive Testing System for Enhanced Learning
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold mb-3">Take a Test</h2>
            <p className="text-gray-600 mb-6">
              Experience our intelligent adaptive testing system that adjusts to your skill level.
            </p>
            <Link href="/login" className="btn btn-primary inline-block">
              Get Started
            </Link>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold mb-3">Admin Portal</h2>
            <p className="text-gray-600 mb-6">
              Manage questions, view test results, and monitor student performance.
            </p>
            <Link href="/login" className="btn btn-secondary inline-block">
              Admin Login
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Adaptive Algorithm</h3>
            <p className="text-sm text-gray-600">
              Questions adapt to your performance in real-time
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Performance Tracking</h3>
            <p className="text-sm text-gray-600">
              Monitor progress with detailed analytics
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2">Secure & Fair</h3>
            <p className="text-sm text-gray-600">
              JWT authentication and role-based access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

