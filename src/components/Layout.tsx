import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Building2,
  UserCheck,
  Briefcase,
  FileText,
  ClipboardList,
  LogOut,
  Menu,
  LayoutDashboard,
  X,
  GraduationCap,
  Building,
  UserCog,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    'Cadastros': true,
    'Acompanhamentos': true,
    'Configurações': true,
    'Relatórios': true
  });

  const menuItems = [
    {
      title: 'Cadastros',
      icon: <Users className="w-5 h-5" />,
      items: [
        { name: 'Alunos/Usuários', path: '/cadastros/alunos', icon: <GraduationCap className="w-4 h-4" /> },
        { name: 'Empresas', path: '/cadastros/empresas', icon: <Building className="w-4 h-4" /> },
        { name: 'Funcionários', path: '/cadastros/funcionarios', icon: <UserCog className="w-4 h-4" /> },
        { name: 'Funções', path: '/cadastros/funcoes', icon: <Briefcase className="w-4 h-4" /> },
        { name: 'Questionários', path: '/cadastros/questionarios', icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Acompanhamentos',
      icon: <ClipboardList className="w-5 h-5" />,
      items: [
        { name: 'Respostas de Questionários', path: '/acompanhamentos/respostas-questionarios', icon: <FileText className="w-4 h-4" /> },
        { name: 'Avaliação do Período de Experiência', path: '/acompanhamentos/avaliacoes', icon: <UserCheck className="w-4 h-4" /> },
        { name: 'Acompanhamento do Mercado de Trabalho', path: '/acompanhamentos/mercado-trabalho', icon: <Building2 className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      items: [
        { name: 'SMTP', path: '/configuracao/smtp', icon: <Building2 className="w-4 h-4" /> },
      ]
    }
  ];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">PE4 - Sistema Acadêmico</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-blue-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col">
          {/* User Info */}
          <div className="p-4 border-b border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{user?.nome}</p>
                <p className="text-xs text-blue-200 capitalize">{user?.tipo_usuario}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pt-6 space-y-6 overflow-y-auto">
            <div key={-1} className='space-y-2'>
              <Link
                key={-1}
                to={'/'}
                className="flex items-center justify-between w-full text-blue-200 text-sm font-medium uppercase tracking-wider hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </div>
              </Link>
            </div>
            {menuItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full text-blue-200 text-sm font-medium uppercase tracking-wider hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  {expandedSections[section.title] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedSections[section.title] && (
                  <div className="ml-6 space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        to={item.path}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${isActive(item.path)
                            ? 'bg-blue-700 text-white'
                            : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                          }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Logout Button */}
          <div className="p-4 border-t border-blue-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900">
                Sistema de Acompanhamento Acadêmico e Profissional
              </h2>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
