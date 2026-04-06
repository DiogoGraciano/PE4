import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PlacementStats } from './dashboardHelpers';

interface PlacementDonutProps {
  stats: PlacementStats;
}

const COLORS = ['#16a34a', '#f59e0b', '#9ca3af']; // green-600, amber-500, gray-400

const PlacementDonut: React.FC<PlacementDonutProps> = ({ stats }) => {
  const total = stats.placed + stats.terminated + stats.unplaced;

  const data = [
    { name: 'Colocados', value: stats.placed },
    { name: 'Desligados', value: stats.terminated },
    { name: 'Não colocados', value: stats.unplaced },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Status de Colocação
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Distribuição dos alunos por situação no mercado de trabalho
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
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={(entry: { value?: number }) => `${entry.value ?? ''}`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} aluno(s)`, String(name)]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PlacementDonut;
