import React, { useMemo } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  Calendar,
  AlertTriangle,
  UserCog,
  Briefcase,
  ClipboardList,
  CalendarClock,
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useCompanies } from '../hooks/useCompanies';
import { useReferrals } from '../hooks/useReferrals';
import { useQuestionnaires } from '../hooks/useQuestionnaires';
import { useQuestionnaireResponses } from '../hooks/useQuestionnaireResponses';
import { useEvents } from '../hooks/useEvents';
import KpiCard from '../components/dashboard/KpiCard';
import PlacementDonut from '../components/dashboard/PlacementDonut';
import GrowthTrendArea from '../components/dashboard/GrowthTrendArea';
import TopCompaniesBar from '../components/dashboard/TopCompaniesBar';
import StudentsByStateBar from '../components/dashboard/StudentsByStateBar';
import EventsByTypePie from '../components/dashboard/EventsByTypePie';
import ResponsesPerQuestionnaireBar from '../components/dashboard/ResponsesPerQuestionnaireBar';
import {
  buildGrowthTrend,
  placementStats,
  topCompanies,
  studentsByState,
  eventsByType,
  responsesPerQuestionnaire,
  recentReferrals,
  studentsNearTermination,
  upcomingEvents,
} from '../components/dashboard/dashboardHelpers';

const Dashboard: React.FC = () => {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { data: referrals = [], isLoading: referralsLoading } = useReferrals();
  const { data: questionnaires = [], isLoading: questionnairesLoading } = useQuestionnaires();
  const { data: responses = [], isLoading: responsesLoading } = useQuestionnaireResponses();
  const { data: events = [], isLoading: eventsLoading } = useEvents();

  const isLoading =
    studentsLoading ||
    companiesLoading ||
    referralsLoading ||
    questionnairesLoading ||
    responsesLoading ||
    eventsLoading;

  const placement = useMemo(
    () => placementStats(students, referrals),
    [students, referrals]
  );

  const growthData = useMemo(
    () => buildGrowthTrend(students, companies, referrals, 12),
    [students, companies, referrals]
  );

  const topCompaniesData = useMemo(
    () => topCompanies(referrals, companies, 5),
    [referrals, companies]
  );

  const stateData = useMemo(() => studentsByState(students, 6), [students]);

  const eventTypeData = useMemo(() => eventsByType(events), [events]);

  const responsesData = useMemo(
    () => responsesPerQuestionnaire(questionnaires, responses),
    [questionnaires, responses]
  );

  const lastReferrals = useMemo(() => recentReferrals(referrals, 5), [referrals]);

  const nearTermination = useMemo(
    () => studentsNearTermination(referrals, 30),
    [referrals]
  );

  const upcoming = useMemo(() => upcomingEvents(events), [events]);

  const activeReferrals = useMemo(
    () => referrals.filter(r => !r.data_desligamento).length,
    [referrals]
  );

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
      title: 'Novo Funcionário',
      description: 'Cadastrar novo funcionário',
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total de Alunos"
          value={students.length}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <KpiCard
          title="Alunos Colocados"
          value={placement.placed}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <KpiCard
          title="Empresas Parceiras"
          value={companies.length}
          icon={<Building2 className="h-6 w-6" />}
          color="purple"
        />
        <KpiCard
          title="Encaminhamentos Ativos"
          value={activeReferrals}
          icon={<Briefcase className="h-6 w-6" />}
          color="amber"
        />
        <KpiCard
          title="Respostas Recebidas"
          value={responses.length}
          icon={<ClipboardList className="h-6 w-6" />}
          color="indigo"
        />
        <KpiCard
          title="Eventos Próximos"
          value={upcoming.length}
          icon={<CalendarClock className="h-6 w-6" />}
          color="rose"
        />
      </div>

      {/* Alerts */}
      {nearTermination.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Encaminhamentos próximos do desligamento
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {nearTermination.length} encaminhamento(s) com data de desligamento nos próximos 30 dias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlacementDonut stats={placement} />
        <GrowthTrendArea data={growthData} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCompaniesBar data={topCompaniesData} />
        <StudentsByStateBar data={stateData} />
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventsByTypePie data={eventTypeData} />
        <ResponsesPerQuestionnaireBar data={responsesData} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Atividade Recente</h2>
          <p className="text-xs text-gray-500 mt-1">Últimos encaminhamentos cadastrados</p>
        </div>
        <div className="p-6">
          {lastReferrals.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Nenhuma atividade recente para exibir</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {lastReferrals.map(r => (
                <li key={r.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.aluno?.nome ?? `Aluno #${r.aluno_id}`}
                      <span className="text-gray-400 font-normal"> → </span>
                      {r.empresa?.razao_social ?? `Empresa #${r.empresa_id}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.funcao ?? 'Função não informada'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
};

export default Dashboard;
