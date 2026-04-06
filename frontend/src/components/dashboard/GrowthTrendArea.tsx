import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthBucket } from './dashboardHelpers';

interface GrowthTrendAreaProps {
  data: MonthBucket[];
}

const GrowthTrendArea: React.FC<GrowthTrendAreaProps> = ({ data }) => {
  const hasData = data.some(
    d => d.alunos > 0 || d.empresas > 0 || d.encaminhamentos > 0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Tendência de Crescimento
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Novos cadastros por mês nos últimos 12 meses
      </p>
      {!hasData ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAlunos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEmpresas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEnc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="alunos"
              name="Alunos"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorAlunos)"
            />
            <Area
              type="monotone"
              dataKey="empresas"
              name="Empresas"
              stroke="#a855f7"
              fillOpacity={1}
              fill="url(#colorEmpresas)"
            />
            <Area
              type="monotone"
              dataKey="encaminhamentos"
              name="Encaminhamentos"
              stroke="#16a34a"
              fillOpacity={1}
              fill="url(#colorEnc)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GrowthTrendArea;
