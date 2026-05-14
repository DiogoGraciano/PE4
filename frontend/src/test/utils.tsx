import type { PropsWithChildren, ReactElement } from 'react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, type RenderOptions, type RenderHookOptions } from '@testing-library/react';
import authReducer from '../store/authSlice';
import uiReducer from '../store/uiSlice';
import type {
  Student,
  Company,
  Employee,
  Referral,
  Questionnaire,
  QuestionnaireResponse,
  ScheduleEvent,
} from '../types';

export const createTestStore = (preloadedState?: Partial<ReturnType<typeof rootReducerForTests>>) =>
  configureStore({
    reducer: rootReducerForTests,
    preloadedState: preloadedState as ReturnType<typeof rootReducerForTests>,
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });

const rootReducerForTests = combineReducers({
  auth: authReducer,
  ui: uiReducer,
});

export type TestStore = ReturnType<typeof createTestStore>;
export type TestRootState = ReturnType<typeof rootReducerForTests>;

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: 0 },
      mutations: { retry: false },
    },
  });

interface ProvidersOptions {
  store?: TestStore;
  queryClient?: QueryClient;
  route?: string;
  routes?: string[];
}

export function buildWrapper({ store, queryClient, route = '/', routes }: ProvidersOptions = {}) {
  const resolvedStore = store ?? createTestStore();
  const resolvedQueryClient = queryClient ?? createTestQueryClient();
  const entries = routes ?? [route];

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={resolvedStore}>
        <QueryClientProvider client={resolvedQueryClient}>
          <MemoryRouter initialEntries={entries}>{children}</MemoryRouter>
        </QueryClientProvider>
      </Provider>
    );
  }

  return { Wrapper, store: resolvedStore, queryClient: resolvedQueryClient };
}

export function renderWithProviders(
  ui: ReactElement,
  options: ProvidersOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { store, queryClient, route, routes, ...renderOptions } = options;
  const { Wrapper, store: resolvedStore, queryClient: resolvedQueryClient } = buildWrapper({
    store,
    queryClient,
    route,
    routes,
  });
  return {
    store: resolvedStore,
    queryClient: resolvedQueryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export function renderHookWithProviders<TResult, TProps>(
  callback: (props: TProps) => TResult,
  options: ProvidersOptions & Omit<RenderHookOptions<TProps>, 'wrapper'> = {},
) {
  const { store, queryClient, route, routes, ...rest } = options;
  const { Wrapper, store: resolvedStore, queryClient: resolvedQueryClient } = buildWrapper({
    store,
    queryClient,
    route,
    routes,
  });
  return {
    store: resolvedStore,
    queryClient: resolvedQueryClient,
    ...renderHook(callback, { wrapper: Wrapper, ...rest }),
  };
}

export const makeStudent = (overrides: Partial<Student> = {}): Student => ({
  id: 1,
  nome: 'Aluno Teste',
  email: 'aluno@test.com',
  telefone: '11999999999',
  cpf: '12345678900',
  cep: '01001000',
  cidade: 'São Paulo',
  estado: 'SP',
  bairro: 'Sé',
  pais: 'Brasil',
  numero_endereco: '100',
  complemento: '',
  codigo: 'A001',
  responsavel: 'Resp Teste',
  observacao: '',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

export const makeCompany = (overrides: Partial<Company> = {}): Company => ({
  id: 1,
  razao_social: 'Empresa Teste LTDA',
  cnpj: '12345678000199',
  cep: '01001000',
  cidade: 'São Paulo',
  estado: 'SP',
  bairro: 'Sé',
  pais: 'Brasil',
  numero_endereco: '200',
  complemento: '',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

export const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: 1,
  nome: 'Funcionário Teste',
  email: 'func@test.com',
  telefone: '11999999999',
  cpf: '12345678900',
  cep: '01001000',
  cidade: 'São Paulo',
  estado: 'SP',
  bairro: 'Sé',
  pais: 'Brasil',
  numero_endereco: '300',
  complemento: '',
  contato_empresarial: '11888888888',
  funcao_id: 1,
  tipo_usuario: 'ADM',
  senha: 'Test1234!',
  confirmacao_senha: 'Test1234!',
  ...overrides,
});

export const makeReferral = (overrides: Partial<Referral> = {}): Referral => ({
  id: 1,
  aluno_id: 1,
  empresa_id: 1,
  funcao: 'Desenvolvedor',
  data_admissao: '2026-01-01',
  contato_rh: 'RH Teste',
  data_desligamento: undefined,
  observacao: '',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

export const makeQuestionnaire = (overrides: Partial<Questionnaire> = {}): Questionnaire => ({
  id: 1,
  nome: 'Questionário Teste',
  questionario_json: JSON.stringify([{ id: 'f1', type: 'input', label: 'Nome' }]),
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

export const makeQuestionnaireResponse = (
  overrides: Partial<QuestionnaireResponse> = {},
): QuestionnaireResponse => ({
  id: 1,
  questionario_id: 1,
  aluno_id: 1,
  respostas_json: JSON.stringify({ f1: 'Resposta' }),
  data_envio: '2026-01-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

export const makeScheduleEvent = (overrides: Partial<ScheduleEvent> = {}): ScheduleEvent => ({
  id: 1,
  titulo: 'Evento Teste',
  descricao: '',
  data_inicio: '2026-06-01T10:00:00.000Z',
  data_fim: '2026-06-01T11:00:00.000Z',
  tipo: 'generico',
  local: '',
  observacao: '',
  aluno_id: null,
  empresa_id: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});
