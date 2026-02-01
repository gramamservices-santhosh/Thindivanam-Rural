'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, Eye, EyeOff, Loader2, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.length !== 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(phone, password);
      showToast('Welcome back!', 'success');
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        showToast('Invalid phone number or password', 'error');
      } else {
        showToast('Failed to login. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with gradient */}
      <div className="gradient-shop pt-12 pb-20 px-6 rounded-b-[40px]">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="Nam Tindivanam" className="h-12" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Store className="text-white" size={24} />
          <h1 className="text-white text-2xl font-bold">Shop Owner</h1>
        </div>
        <p className="text-white/80 text-center">
          Manage your shop and orders
        </p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  className="input-field pl-10"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center mt-6 text-gray-600">
            New shop owner?{' '}
            <Link href="/register" className="text-green-600 font-semibold hover:underline">
              Register your shop
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">
          Grow your business with Nam Tindivanam
        </p>
      </div>
    </div>
  );
}
