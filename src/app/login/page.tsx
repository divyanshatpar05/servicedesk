'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userId.trim() || !password.trim()) {
      setError('Please enter User ID and Password.');
      return;
    }
    setSubmitting(true);
    try {
      // Map userId to email format
      let email = userId.trim();
      if (!email.includes('@')) {
        email = `${email}@indosales.in`;
      }
      await signIn(email, password);
      router.push('/');
      router.refresh();
    } catch {
      setError('Invalid User ID or Password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a4a] via-[#2d6a8a] to-[#1a3a4a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-4">
            <span className="text-3xl font-black text-[#2d6a8a]">IS</span>
          </div>
          <h1 className="text-white text-[22px] font-bold tracking-wide">Indo Sales and Service Desk</h1>
          <p className="text-white/60 text-[13px] mt-1">Customer Relationship Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#2d6a8a] px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white">
              <LogIn size={18} />
              <span className="font-bold text-[15px] tracking-wider">USER LOGIN</span>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">User Id</label>
                <input
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder="Enter your User ID"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#2d6a8a] transition-colors"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#2d6a8a] transition-colors pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-[12px] text-red-600 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#2d6a8a] text-white rounded-lg text-[14px] font-bold hover:bg-[#245a78] disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-2 tracking-wider"
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <><LogIn size={16} /> LOGIN</>}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Demo Credentials</p>
              </div>
              <div className="px-4 py-3 space-y-1.5 max-h-48 overflow-y-auto">
                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-500 font-semibold">Admin:</span>
                  <span className="font-mono font-semibold text-gray-700">admin / Admin@2026</span>
                </div>
                <div className="border-t border-gray-100 pt-1.5 mt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Users (01–10)</p>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">user01–user10</span>
                    <span className="font-mono font-semibold text-gray-700">User01@2026 – User10@2026</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-1.5 mt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Technicians (01–10)</p>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">tech01–tech10</span>
                    <span className="font-mono font-semibold text-gray-700">Tech01@2026 – Tech10@2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/40 text-[11px] mt-6">
          © 2026 Indo Sales and Service Desk. All rights reserved.
        </p>
      </div>
    </div>
  );
}
