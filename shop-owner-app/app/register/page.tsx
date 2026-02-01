'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, User, Phone, Mail, Lock, MapPin, Eye, EyeOff, Loader2, Clock, Truck, IndianRupee } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

const categories = [
  { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { value: 'groceries', label: 'Groceries', icon: '🛒' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'snacks', label: 'Snacks', icon: '🍪' },
  { value: 'mixed', label: 'Mixed/General', icon: '🏪' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    category: 'vegetables',
    deliveryCharge: '20',
    deliveryRadius: '5',
    openTime: '07:00',
    closeTime: '21:00',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
    } else if (name === 'deliveryCharge' || name === 'deliveryRadius') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep1 = () => {
    if (!formData.shopName.trim()) {
      showToast('Please enter shop name', 'error');
      return false;
    }
    if (!formData.ownerName.trim()) {
      showToast('Please enter owner name', 'error');
      return false;
    }
    if (formData.phone.length !== 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return false;
    }
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address.trim()) {
      showToast('Please enter shop address', 'error');
      return false;
    }
    if (!formData.deliveryCharge) {
      showToast('Please enter delivery charge', 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);
    try {
      await register({
        shopName: formData.shopName.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone,
        email: formData.email.trim() || undefined,
        password: formData.password,
        address: formData.address.trim(),
        category: formData.category as any,
        deliveryCharge: parseInt(formData.deliveryCharge) || 20,
        deliveryRadius: Math.min(parseInt(formData.deliveryRadius) || 5, 10),
        businessHours: {
          open: formData.openTime,
          close: formData.closeTime,
        },
      });
      showToast('Shop registered successfully!', 'success');
      router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        showToast('Phone number already registered', 'error');
      } else {
        showToast('Failed to register. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with gradient */}
      <div className="gradient-shop pt-8 pb-16 px-6 rounded-b-[40px]">
        <div className="flex justify-center mb-4">
          <img src="/logo.svg" alt="Nam Tindivanam" className="h-10" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Store className="text-white" size={24} />
          <h1 className="text-white text-2xl font-bold">Register Shop</h1>
        </div>
        <p className="text-white/80 text-center">Step {step} of 2</p>

        {/* Progress Bar */}
        <div className="flex gap-2 mt-4">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
        </div>
      </div>

      {/* Register Form */}
      <div className="flex-1 px-6 -mt-8 pb-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Shop Details</h2>

                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Store size={20} />
                    </div>
                    <input
                      type="text"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      placeholder="e.g., Kumar Vegetables"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit number"
                      className="input-field pl-10"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary w-full mt-6"
                >
                  Next
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Business Settings</h2>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Address *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Full shop address"
                      rows={2}
                      className="input-field pl-10 resize-none"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.category === cat.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <p className="text-xs mt-1 text-gray-700">{cat.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Charge & Radius */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Charge</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <IndianRupee size={18} />
                      </div>
                      <input
                        type="text"
                        name="deliveryCharge"
                        value={formData.deliveryCharge}
                        onChange={handleChange}
                        placeholder="20"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Radius (km)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Truck size={18} />
                      </div>
                      <input
                        type="text"
                        name="deliveryRadius"
                        value={formData.deliveryRadius}
                        onChange={handleChange}
                        placeholder="5"
                        className="input-field pl-10"
                        max={10}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Max 10 km</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Open Time</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Clock size={18} />
                        </div>
                        <input
                          type="time"
                          name="openTime"
                          value={formData.openTime}
                          onChange={handleChange}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Close Time</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Clock size={18} />
                        </div>
                        <input
                          type="time"
                          name="closeTime"
                          value={formData.closeTime}
                          onChange={handleChange}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Register Shop'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Already have a shop?{' '}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
