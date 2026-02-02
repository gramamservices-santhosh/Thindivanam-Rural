'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Phone, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/components/Toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    secretCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.password) {
      showToast('Please fill all fields', 'error');
      return;
    }

    // Verify admin phone from env
    const adminPhones = (process.env.NEXT_PUBLIC_ADMIN_PHONES || '').split(',').map(p => p.trim());
    if (!adminPhones.includes(formData.phone)) {
      showToast('Unauthorized phone number', 'error');
      return;
    }

    setLoading(true);
    const email = `admin_${formData.phone}@namtindivanam.app`;

    try {
      if (isRegister) {
        // Check secret code
        const secretCode = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'ADMIN2024';
        if (formData.secretCode !== secretCode) {
          showToast('Invalid secret code', 'error');
          setLoading(false);
          return;
        }

        if (!formData.name) {
          showToast('Please enter your name', 'error');
          setLoading(false);
          return;
        }

        // Register new admin
        const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);

        await setDoc(doc(db, 'admins', userCredential.user.uid), {
          adminId: userCredential.user.uid,
          name: formData.name,
          phone: formData.phone,
          email: email,
          role: 'super_admin',
          createdAt: Timestamp.now(),
        });

        showToast('Admin account created!', 'success');
        router.push('/admin');
      } else {
        // Login existing admin
        await signInWithEmailAndPassword(auth, email, formData.password);

        // Verify admin exists in admins collection
        const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser!.uid));
        if (!adminDoc.exists()) {
          showToast('Admin account not found. Please register first.', 'error');
          setLoading(false);
          return;
        }

        showToast('Welcome back, Admin!', 'success');
        router.push('/admin');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/user-not-found') {
        showToast('Admin not found. Please register first.', 'error');
        setIsRegister(true);
      } else if (error.code === 'auth/wrong-password') {
        showToast('Incorrect password', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        showToast('Admin already registered. Please login.', 'error');
        setIsRegister(false);
      } else {
        showToast(error.message || 'Authentication failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-white/60 text-sm mt-1">Nam Tindivanam Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isRegister ? 'Create Admin Account' : 'Admin Login'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Code</label>
                <input
                  type="password"
                  value={formData.secretCode}
                  onChange={(e) => setFormData(p => ({ ...p, secretCode: e.target.value }))}
                  placeholder="Enter admin secret code"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Contact platform owner for secret code</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isRegister ? 'Creating...' : 'Logging in...'}
                </>
              ) : (
                isRegister ? 'Create Admin Account' : 'Login as Admin'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-purple-600 font-medium text-sm"
            >
              {isRegister ? 'Already have admin account? Login' : 'First time? Register as Admin'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <a href="/login" className="text-gray-500 text-sm">
              ← Back to Shop Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
