import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, FileText, TrendingUp, Calendar, AlertTriangle, UserCog } from 'lucide-react';
import apiService from '../services/api';

interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  totalFunctions: number;
  activeStudents: number;
  studentsNearTermination: number;
  recentEvaluations: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCompanies: 0,
    totalFunctions: 0,
    activeStudents: 0,
    studentsNearTermination: 0,
    recentEvaluations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados básicos
      const [studentsRes, companiesRes, functionsRes] = await Promise.all([
        apiService.getStudents(),
        apiService.getCompanies(),
        apiService.getFunctions(),
      ]);

      const students = studentsRes.data;
      const activeStudents = students.filter((s: any) => !s.data_desligamento).length;
      const studentsNearTermination = students.filter((s: any) => {
        if (!s.data_desligamento) return false;
        const terminationDate = new Date(s.data_desligamento);
        const today = new Date();
        const diffTime = terminationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
      }).length;

      setStats({
        totalStudents: students.length,
        totalCompanies: companiesRes.data.length,
        totalFunctions: functionsRes.data.length,
        activeStudents,
        studentsNearTermination,
        recentEvaluations: 0, // Será implementado quando houver avaliações
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Alunos',
      value: stats.totalStudents,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Alunos Ativos',
      value: stats.activeStudents,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Empresas Parceiras',
      value: stats.totalCompanies,
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Funções/Cargos',
      value: stats.totalFunctions,
      icon: <Briefcase className="h-6 w-6" />,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickActions = [
    {
      title: 'Novo Aluno',
      description: 'Cadastrar novo aluno/usuário',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/cadastros/alunos',
    },
    {
      title: 'Nova Empresa',
      description: 'Cadastrar nova empresa parceira',
      icon: <Building2 className="h-8 w-8" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/cadastros/empresas',
    },
    {
      title: 'Nova Função',
      description: 'Cadastrar nova função/cargo',
      icon: <Briefcase className="h-8 w-8" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: '/cadastros/funcoes',
    },
    {
      title: 'Novo Funcionario',
      description: 'Cadastrar novo funcionario',
      icon: <UserCog className="w-8 h-8" />,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/cadastros/funcionarios',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visão geral do sistema de acompanhamento acadêmico e profissional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={`${stat.textColor}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {stats.studentsNearTermination > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Alunos próximos do desligamento
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {stats.studentsNearTermination} aluno(s) tem data de desligamento nos próximos 30 dias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-4`}>
                  {action.icon}
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{action.title}</h3>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Atividade Recente</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Nenhuma atividade recente para exibir</p>
            <p className="text-xs text-gray-400 mt-1">
              As atividades do sistema aparecerão aqui
            </p>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>Versão:</strong> PE4 v1.0.0</p>
            <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p><strong>Status:</strong> <span className="text-green-600">Operacional</span></p>
            <p><strong>Backup:</strong> Automático diário</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
