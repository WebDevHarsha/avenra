'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import AuthForm from '../components/AuthForm';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuthPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <AuthForm onSuccess={() => router.push('/dashboard')} />
      </div>
    </div>
  );
}