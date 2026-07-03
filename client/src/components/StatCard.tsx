import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-full">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      {subtitle && (
        <div className="mt-4 flex items-center text-sm">
          {trend === 'up' && <span className="text-emerald-600 font-medium mr-2">↑</span>}
          {trend === 'down' && <span className="text-red-600 font-medium mr-2">↓</span>}
          <span className="text-gray-500">{subtitle}</span>
        </div>
      )}
    </div>
  );
};
