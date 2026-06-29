'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signUp(email, password);
      router.push('/');
    } catch (err: any) {
      toast.error(err.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err: any) {
      toast.error(err.message ?? 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo-icon.png" alt="QuickCourt" width={80} height={80} className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Join QuickCourt and start playing</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.145 24.5c0-1.548-.138-3.037-.395-4.477H24v8.475h12.454c-.537 2.895-2.17 5.348-4.627 6.99v5.812h7.487c4.38-4.035 6.831-9.979 6.831-16.8z"/><path fill="#34A853" d="M24 47c6.237 0 11.466-2.067 15.287-5.598l-7.487-5.812c-2.068 1.386-4.714 2.205-7.8 2.205-5.998 0-11.079-4.051-12.892-9.495H3.448v6.002C7.253 41.87 15.027 47 24 47z"/><path fill="#FBBC05" d="M11.108 28.3A13.97 13.97 0 0 1 10.5 24c0-1.493.255-2.942.608-4.3v-6.002H3.448A23.966 23.966 0 0 0 0 24c0 3.874.928 7.539 2.563 10.802l8.545-6.502z"/><path fill="#EA4335" d="M24 10.205c3.38 0 6.413 1.163 8.8 3.443l6.596-6.596C35.462 3.355 30.233 1 24 1 15.027 1 7.253 6.13 3.448 13.698l8.66 6.002C13.921 14.256 19.002 10.205 24 10.205z"/></svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
