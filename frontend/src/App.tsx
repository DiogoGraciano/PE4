import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

// Páginas de Cadastros
import Students from './pages/cadastros/Students';
import Companies from './pages/cadastros/Companies';
import Functions from './pages/cadastros/Functions';
import Employees from './pages/cadastros/Employees';
import Questionnaires from './pages/cadastros/Questionnaires';
import QuestionnaireResponses from './pages/acompanhamentos/QuestionnaireResponses';
import Dashboard from './pages/Dashboard';

// Páginas de Autenticação e Configuração
import ForgotPassword from './pages/ForgotPassword';
import SmtpConfig from './pages/SmtpConfig';

// Páginas de Questionários
import QuestionnaireList from './pages/QuestionnaireList';
import AnswerQuestionnaire from './pages/AnswerQuestionnaire';
import StudentResponses from './pages/StudentResponses';

// Componente principal do aplicativo
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        
        {/* Rotas de Cadastros */}
        <Route path="cadastros">
          <Route path="alunos" element={<Students />} />
          <Route path="empresas" element={<Companies />} />
          <Route path="funcoes" element={<Functions />} />
          <Route path="funcionarios" element={<Employees />} />
          <Route path="questionarios" element={<Questionnaires />} />
          {/* Adicionar outras rotas de cadastros aqui */}
        </Route>

        {/* Rotas de Acompanhamentos */}
        <Route path="acompanhamentos">
          <Route path="respostas-questionarios" element={<QuestionnaireResponses />} />
        </Route>

        {/* Rotas de Questionários */}
        <Route path="questionarios">
          <Route path="listar" element={<QuestionnaireList />} />
          <Route path="responder/:id" element={<AnswerQuestionnaire />} />
        </Route>

        {/* Rotas de Alunos - Respostas */}
        <Route path="alunos">
          <Route path=":studentId/respostas" element={<StudentResponses />} />
        </Route>

        {/* Rotas de Configuração */}
        <Route path="configuracao">
          <Route path="smtp" element={<SmtpConfig />} />
        </Route>

        {/* Rotas de Relatórios */}
        <Route path="relatorios">
          {/* Adicionar rotas de relatórios aqui */}
        </Route>

        {/* Rota padrão para rotas não encontradas */}
        <Route path="*" element={<Navigate to="/cadastros/alunos" replace />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
