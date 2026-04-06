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

interface ResponsesPerQuestionnaireBarProps {
  data: NamedCount[];
}

const ResponsesPerQuestionnaireBar: React.FC<ResponsesPerQuestionnaireBarProps> = ({
  data,
}) => {
  const hasData = data.some(d => d.count > 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Respostas por Questionário
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Total de respostas recebidas em cada questionário
      </p>
      {!hasData ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip formatter={value => [`${value} resposta(s)`, '']} />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ResponsesPerQuestionnaireBar;
