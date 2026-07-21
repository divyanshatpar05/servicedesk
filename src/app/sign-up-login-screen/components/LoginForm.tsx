'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: { remember: false }
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back! Signed in successfully.');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setError('email', { message: error?.message || 'Invalid email or password' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-7">
        <h2 className="text-[22px] font-bold text-foreground mb-1">Sign in to Indo Sales and Service Desk</h2>
        <p className="text-[13px] text-muted-foreground">Enter your credentials to access the service portal</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1">Email Address</label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
            })}
            type="email"
            placeholder="you@servicedesk.in"
            className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {errors.email && <p className="text-[11px] text-danger mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1">Password</label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-danger mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('remember')}
              type="checkbox"
              className="w-3.5 h-3.5 accent-primary rounded"
            />
            <span className="text-[12px] text-muted-foreground">Remember me</span>
          </label>
          <button type="button" className="text-[12px] font-semibold text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-2"
        >
          {submitting ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : 'Sign In'}
        </button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-6 rounded-xl border border-border bg-muted/40 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Demo Account</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[12px] text-foreground font-semibold">admin@indosales.in</p>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Admin@2026</p>
          <p className="text-[10px] text-muted-foreground mt-1">Created via database migration</p>
        </div>
      </div>

      <p className="text-center text-[12px] text-muted-foreground mt-6">
        New service center?{' '}
        <button onClick={onSwitchToSignup} className="text-primary font-semibold hover:underline">
          Create an account
        </button>
      </p>
    </div>
  );
}