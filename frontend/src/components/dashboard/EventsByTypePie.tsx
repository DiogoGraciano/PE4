import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { EventTypeCount } from './dashboardHelpers';

interface EventsByTypePieProps {
  data: EventTypeCount[];
}

const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#9ca3af'];

const EventsByTypePie: React.FC<EventsByTypePieProps> = ({ data }) => {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Eventos por Tipo
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Distribuição dos eventos agendados por categoria
      </p>
      {total === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="count"
              nameKey="label"
              label={(entry: { value?: number }) =>
                entry.value && entry.value > 0 ? `${entry.value}` : ''
              }
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} evento(s)`, String(name)]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EventsByTypePie;
