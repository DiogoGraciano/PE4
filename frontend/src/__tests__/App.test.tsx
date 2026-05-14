import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { authState } = vi.hoisted(() => ({ authState: { isAuthenticated: false } }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: ReactNode }) => (
      <actual.MemoryRouter initialEntries={['/']}>{children}</actual.MemoryRouter>
    ),
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
    user: authState.isAuthenticated ? { id: 1, nome: 'X' } : null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../components/Layout', () => ({ default: () => <div data-testid="layout">Layout</div> }));
vi.mock('../pages/Login', () => ({ default: () => <div data-testid="login">Login</div> }));
vi.mock('../pages/ForgotPassword', () => ({ default: () => <div data-testid="fp">FP</div> }));
vi.mock('../pages/ResetPassword', () => ({ default: () => <div data-testid="rp">RP</div> }));
vi.mock('../pages/Dashboard', () => ({ default: () => <div>dashboard</div> }));
vi.mock('../pages/cadastros/Students', () => ({ default: () => <div>students</div> }));
vi.mock('../pages/cadastros/Companies', () => ({ default: () => <div>companies</div> }));
vi.mock('../pages/cadastros/Employees', () => ({ default: () => <div>employees</div> }));
vi.mock('../pages/cadastros/Questionnaires', () => ({ default: () => <div>questionnaires</div> }));
vi.mock('../pages/acompanhamentos/QuestionnaireResponses', () => ({
  default: () => <div>qresponses</div>,
}));
vi.mock('../pages/SmtpConfig', () => ({ default: () => <div>smtp</div> }));
vi.mock('../pages/QuestionnaireList', () => ({ default: () => <div>qlist</div> }));
vi.mock('../pages/AnswerQuestionnaire', () => ({ default: () => <div>answer</div> }));
vi.mock('../pages/StudentResponses', () => ({ default: () => <div>studentresp</div> }));
vi.mock('../pages/agenda/Schedule', () => ({ default: () => <div>schedule</div> }));

import App from '../App';

describe('App router', () => {
  it('redirects unauthenticated users to /login', () => {
    authState.isAuthenticated = false;
    render(<App />);
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('renders Layout when authenticated', () => {
    authState.isAuthenticated = true;
    render(<App />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });
});
