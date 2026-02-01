'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Phone, Mail, MapPin, RefreshCw } from 'lucide-react';
import AdminOnly from '@/components/AdminOnly';
import { getAllCustomers } from '@/lib/firestore/admin';
import { User } from '@/types';

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdminOnly>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 pt-4 pb-6 rounded-b-[30px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-white text-xl font-bold flex-1">Customers</h1>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
              {customers.length} users
            </span>
          </div>
        </div>

        {/* Customers List */}
        <div className="px-4 py-4 space-y-3">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <div key={customer.userId} className="bg-white rounded-2xl p-4 card-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone size={14} />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Mail size={14} />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.addresses?.[0] && (
                      <div className="flex items-start gap-2 text-sm text-gray-500 mt-1">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{customer.addresses[0].address}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Joined: {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No customers yet</p>
            </div>
          )}
        </div>
      </div>
    </AdminOnly>
  );
}
