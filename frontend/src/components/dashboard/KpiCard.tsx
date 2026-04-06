import React from 'react';

export type KpiColor = 'blue' | 'green' | 'purple' | 'amber' | 'indigo' | 'rose';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: KpiColor;
}

const COLOR_MAP: Record<KpiColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color }) => {
  const c = COLOR_MAP[color];
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${c.bg}`}>
          <div className={c.text}>{icon}</div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
