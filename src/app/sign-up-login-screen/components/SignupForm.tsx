'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SignupFormData {
  serviceCenterName: string;
  adminName: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm<SignupFormData>();
  const watchPassword = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setSubmitting(true);
    try {
      await signUp(data.email, data.password, {
        fullName: data.adminName,
        avatarUrl: ''
      });
      toast.success(`Service center "${data.serviceCenterName}" registered! You can now sign in.`);
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setError('email', { message: error?.message || 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-foreground mb-1">Register your Service Center</h2>
        <p className="text-[13px] text-muted-foreground">Set up your Indo Sales and Service Desk account in under 2 minutes</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1">Service Center Name <span className="text-danger">*</span></label>
          <input
            {...register('serviceCenterName', { required: 'Service center name is required', minLength: { value: 3, message: 'Minimum 3 characters' } })}
            placeholder="e.g. Mehta Electronics Service Center"
            className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {errors.serviceCenterName && <p className="text-[11px] text-danger mt-1">{errors.serviceCenterName.message}</p>}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1">Admin Full Name <span className="text-danger">*</span></label>
          <input
            {...register('adminName', { required: 'Admin name is required' })}
            placeholder="e.g. Suresh Mehta"
            className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {errors.adminName && <p className="text-[11px] text-danger mt-1">{errors.adminName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Email <span className="text-danger">*</span></label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
              })}
              type="email"
              placeholder="admin@center.in"
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
            />
            {errors.email && <p className="text-[11px] text-danger mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Mobile <span className="text-danger">*</span></label>
            <input
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' }
              })}
              placeholder="9820XXXXXX"
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
            />
            {errors.phone && <p className="text-[11px] text-danger mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1">City / Location <span className="text-danger">*</span></label>
          <input
            {...register('city', { required: 'City is required' })}
            placeholder="e.g. Mumbai"
            className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {errors.city && <p className="text-[11px] text-danger mt-1">{errors.city.message}</p>}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1">Password <span className="text-danger">*</span></label>
          <p className="text-[10px] text-muted-foreground mb-1">Minimum 8 characters with at least one uppercase and one number</p>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                pattern: { value: /^(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase letter and number' }
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-danger mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1">Confirm Password <span className="text-danger">*</span></label>
          <div className="relative">
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: val => val === watchPassword || 'Passwords do not match'
              })}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[11px] text-danger mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              {...register('agreeTerms', { required: 'You must accept the terms to continue' })}
              type="checkbox"
              className="w-3.5 h-3.5 accent-primary mt-0.5 flex-shrink-0"
            />
            <span className="text-[12px] text-muted-foreground leading-relaxed">
              I agree to the{' '}
              <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary font-semibold cursor-pointer hover:underline">Privacy Policy</span>
            </span>
          </label>
          {errors.agreeTerms && <p className="text-[11px] text-danger mt-1">{errors.agreeTerms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-1"
        >
          {submitting ? <><Loader2 size={14} className="animate-spin" /> Creating account…</> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-[12px] text-muted-foreground mt-5">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}