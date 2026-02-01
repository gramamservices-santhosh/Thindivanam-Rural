'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple';
  subtitle?: string;
}

const colorClasses = {
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
};

export default function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-lg mb-2" />
      <div className="h-7 bg-gray-200 rounded w-16 mb-1" />
      <div className="h-4 bg-gray-200 rounded w-24" />
    </div>
  );
}
