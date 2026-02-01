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
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-violet-50 text-violet-600',
};

const valueColorClasses = {
  green: 'text-emerald-600',
  blue: 'text-blue-600',
  orange: 'text-amber-600',
  red: 'text-red-600',
  purple: 'text-violet-600',
};

export default function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 card-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${valueColorClasses[color]}`}>{value}</p>
      <p className="text-sm text-slate-500 font-medium mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 card-shadow">
      <div className="w-11 h-11 skeleton rounded-xl mb-3" />
      <div className="h-7 skeleton rounded-lg w-20 mb-2" />
      <div className="h-4 skeleton rounded-lg w-24" />
    </div>
  );
}
