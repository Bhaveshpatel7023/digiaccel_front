'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setTestInfo, setCurrentQuestion, updateTestProgress, resetTest } from '@/store/slices/testSlice';
import { testAPI } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { testId, currentQuestion, score, totalQuestions, isTestCompleted, completionReason, testStatus } =
    useAppSelector((state) => state.test);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const uniqueUrl = params.uniqueUrl as string;
  
  // Wait for auth to load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  // Load test info
  useEffect(() => {
    if (!uniqueUrl) return;

    const loadTest = async () => {
      try {
        const response = await testAPI.getTestByUrl(uniqueUrl);
        const { testId: fetchedTestId, status, exists } = response.data;
        
        // If test doesn't exist yet, it will be created when user registers
        if (!exists) {
          console.log('Test will be created upon registration');
          return;
        }
        
        dispatch(setTestInfo({ testId: fetchedTestId, uniqueUrl }));
        
        if (status === 'completed') {
          dispatch(updateTestProgress({
            score: 0,
            totalQuestions: 0,
            isTestCompleted: true,
            completionReason: 'Test already completed',
          }));
        }
      } catch (error: any) {
        // Silently handle error - test will be created on registration
        console.log('Test not yet created, will be created on registration');
      }
    };

    loadTest();
  }, [uniqueUrl, dispatch]);

  // Handle authentication and test loading
  useEffect(() => {
    // Wait for initial auth check to complete
    if (isCheckingAuth) return;
    
    if (!isAuthenticated) {
      // Not authenticated - show login/register choice
      router.push(`/auth-choice?testUrl=${uniqueUrl}`);
      return;
    }
    
    if (isAuthenticated && !testId) {
      // User is authenticated but test not loaded yet, try to load it
      const loadTestForAuthenticatedUser = async () => {
        // First check if we have a pending test from registration/login
        const pendingTestId = localStorage.getItem('pendingTestId');
        const pendingTestUrl = localStorage.getItem('pendingTestUrl');
        
        if (pendingTestId && pendingTestUrl === uniqueUrl) {
          // Use the test ID from registration/login
          console.log('Loading test from localStorage:', pendingTestId);
          dispatch(setTestInfo({ testId: pendingTestId, uniqueUrl }));
          localStorage.removeItem('pendingTestId');
          localStorage.removeItem('pendingTestUrl');
          return;
        }
        
        // Otherwise fetch from API
        try {
          console.log('Fetching test from API:', uniqueUrl);
          const response = await testAPI.getTestByUrl(uniqueUrl);
          const { testId: fetchedTestId, status, exists } = response.data;
          
          if (exists && fetchedTestId) {
            console.log('Test found:', fetchedTestId);
            dispatch(setTestInfo({ testId: fetchedTestId, uniqueUrl }));
            
            if (status === 'completed') {
              dispatch(updateTestProgress({
                score: 0,
                totalQuestions: 0,
                isTestCompleted: true,
                completionReason: 'Test already completed',
              }));
            }
          } else {
            // Test doesn't exist - this shouldn't happen if login/register worked correctly
            console.error('Test not found for uniqueUrl:', uniqueUrl);
            toast.error('Test not found. Please try logging in again.');
          }
        } catch (error) {
          console.error('Error loading test:', error);
          toast.error('Failed to load test. Please try again.');
        }
      };
      
      loadTestForAuthenticatedUser();
    }
  }, [isAuthenticated, uniqueUrl, testId, dispatch, isCheckingAuth]);

  const handleStartTest = async () => {
    if (!testId) {
      toast.error('Test ID not found. Please refresh the page.');
      console.error('No testId available');
      return;
    }

    setIsStarting(true);
    try {
      const response = await testAPI.startTest(testId);
      const { question } = response.data;
      
      if (question) {
        dispatch(setCurrentQuestion(question));
        toast.success('Test started! Good luck!');
      }
    } catch (error: any) {
      console.error('Start test error:', error);
      toast.error(error.response?.data?.message || 'Failed to start test');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !testId) return;

    setIsSubmitting(true);
    setShowResult(false);

    try {
      const response = await testAPI.submitAnswer(
        testId,
        currentQuestion.questionId,
        selectedAnswer
      );

      const { isCorrect, correctAnswer, currentScore, testCompleted, completionReason, totalQuestions, nextQuestion } =
        response.data;

      // Show result
      setLastResult({ isCorrect, correctAnswer, selectedAnswer });
      setShowResult(true);

      // Update test progress
      dispatch(
        updateTestProgress({
          score: currentScore,
          totalQuestions,
          isTestCompleted: testCompleted,
          completionReason,
          nextQuestion,
        })
      );

      // Reset selected answer after a delay
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  
  if (user?.isAdmin) {
    return null; // Will redirect via useEffect
  }

  if (isTestCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="card text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Completed!</h1>
            <p className="text-lg text-gray-600 mb-8">{completionReason}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-primary-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Total Score</p>
                <p className="text-4xl font-bold text-primary-600">{score}</p>
              </div>
              <div className="bg-primary-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Questions Answered</p>
                <p className="text-4xl font-bold text-primary-600">{totalQuestions}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/dashboard" className="btn btn-primary inline-block">
                Go to Dashboard
              </Link>
              <p className="text-sm text-gray-500">
                Your test results have been saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testStatus === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="card text-center">
            <div className="text-6xl mb-6">📝</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Ready to Begin?</h1>
            <p className="text-lg text-gray-600 mb-8">
              This is an adaptive test that adjusts to your skill level. Answer questions to the best of your ability.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-lg mb-4">Test Rules:</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Questions start at medium difficulty and adapt based on your answers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Correct answers increase difficulty, incorrect answers decrease it</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>The test ends after 20 questions or when meeting completion criteria</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Your score increases by question difficulty for each correct answer</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartTest}
              disabled={isStarting}
              className="btn btn-primary text-lg px-8"
            >
              {isStarting ? 'Starting...' : 'Start Test'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading next question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Adaptive Test</h1>
            <p className="text-gray-600">Question {totalQuestions + 1} of 20</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Score</p>
            <p className="text-3xl font-bold text-primary-600">{score}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-300"
              style={{ width: `${((totalQuestions + 1) / 20) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-primary-600">
                Difficulty: {currentQuestion.difficulty}/10
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{currentQuestion.question}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && setSelectedAnswer(option)}
                disabled={showResult || isSubmitting}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedAnswer === option
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  }
                  ${showResult && lastResult?.correctAnswer === option ? 'border-green-500 bg-green-50' : ''}
                  ${
                    showResult && selectedAnswer === option && !lastResult?.isCorrect
                      ? 'border-red-500 bg-red-50'
                      : ''
                  }
                  disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center">
                  <div
                    className={`
                    w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                    ${
                      selectedAnswer === option
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300'
                    }
                  `}
                  >
                    {selectedAnswer === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Result Message */}
          {showResult && lastResult && (
            <div
              className={`
              mb-6 p-4 rounded-lg
              ${lastResult.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
            `}
            >
              <p className="font-semibold">
                {lastResult.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </p>
              {!lastResult.isCorrect && (
                <p className="text-sm mt-1">Correct answer: {lastResult.correctAnswer}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || isSubmitting || showResult}
            className="btn btn-primary w-full text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}

