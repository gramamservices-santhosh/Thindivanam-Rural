'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Phone, Lock, ShoppingBag } from 'lucide-react';
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
    <div className="login-container">
      {/* Header Section */}
      <div className="login-header">
        <div className="login-logo">
          <ShoppingBag className="text-white" size={36} />
        </div>
        <h1 className="login-title">Welcome Back!</h1>
        <p className="login-subtitle">Login to order fresh groceries</p>
      </div>

      {/* Login Card */}
      <div className="login-card animate-fade-in">
        <form onSubmit={handleSubmit} className="login-form">
          {/* Phone Input */}
          <div>
            <label className="form-label">Phone Number</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit number"
                className="input-field input-with-icon"
                maxLength={10}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field input-with-icon input-with-icon-right"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
            style={{ marginTop: '8px' }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">or</span>
          <div className="login-divider-line" />
        </div>

        {/* Register Link */}
        <div className="login-footer">
          <p className="login-footer-text">
            New user?{' '}
            <Link href="/register" className="login-footer-link">
              Create an account
            </Link>
          </p>
        </div>

        {/* Tagline */}
        <p className="login-tagline">
          Fresh groceries delivered to your doorstep
        </p>
      </div>
    </div>
  );
}
