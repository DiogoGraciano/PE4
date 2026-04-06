import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { NamedCount } from './dashboardHelpers';

interface TopCompaniesBarProps {
  data: NamedCount[];
}

const TopCompaniesBar: React.FC<TopCompaniesBarProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Top Empresas Contratantes
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Empresas com maior número de encaminhamentos
      </p>
      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={140}
            />
            <Tooltip
              formatter={value => [`${value} encaminhamento(s)`, '']}
            />
            <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopCompaniesBar;
