import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  clearAuth,
  setCredentials,
  loginThunk,
  logoutThunk,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
} from './authSlice';
import apiService from '../services/api';
import type { Employee } from '../types';

vi.mock('../services/api', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockedApi = vi.mocked(apiService);

const buildStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });

const fakeUser: Employee = {
  id: 1,
  nome: 'User',
  email: 'u@test.com',
  telefone: '',
  cpf: '',
  cep: '',
  cidade: '',
  estado: '',
  bairro: '',
  pais: '',
  numero_endereco: '',
  complemento: '',
  contato_empresarial: '',
  funcao_id: 1,
  senha: '',
  confirmacao_senha: '',
};

describe('authSlice synchronous reducers', () => {
  it('has expected initial state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual({
      user: null,
      token: null,
      isLoading: false,
    });
  });

  it('clearAuth resets state and removes localStorage entries', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify(fakeUser));

    const state = authReducer(
      { user: fakeUser, token: 'abc', isLoading: true },
      clearAuth(),
    );
    expect(state).toEqual({ user: null, token: null, isLoading: false });
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('setCredentials writes user and token', () => {
    const state = authReducer(undefined, setCredentials({ user: fakeUser, token: 'xyz' }));
    expect(state.user).toEqual(fakeUser);
    expect(state.token).toBe('xyz');
  });
});

describe('authSlice selectors', () => {
  it('selectUser, selectIsAuthenticated, selectAuthLoading', () => {
    const root = {
      auth: { user: fakeUser, token: 't', isLoading: true },
    } as unknown as Parameters<typeof selectUser>[0];
    expect(selectUser(root)).toEqual(fakeUser);
    expect(selectIsAuthenticated(root)).toBe(true);
    expect(selectAuthLoading(root)).toBe(true);

    const empty = {
      auth: { user: null, token: null, isLoading: false },
    } as unknown as Parameters<typeof selectUser>[0];
    expect(selectIsAuthenticated(empty)).toBe(false);
  });
});

describe('loginThunk', () => {
  beforeEach(() => {
    mockedApi.login.mockReset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('stores user and token on success', async () => {
    mockedApi.login.mockResolvedValueOnce({ user: fakeUser, token: 'tok' });
    const store = buildStore();
    await store.dispatch(loginThunk({ email: 'u@test.com', password: 'pass' }));
    expect(store.getState().auth.user).toEqual(fakeUser);
    expect(store.getState().auth.token).toBe('tok');
    expect(localStorage.getItem('token')).toBe('tok');
    expect(JSON.parse(localStorage.getItem('user') ?? '{}')).toEqual(fakeUser);
  });

  it('rejects when response is malformed', async () => {
    mockedApi.login.mockResolvedValueOnce({ user: null as unknown as Employee, token: '' });
    const store = buildStore();
    const action = await store.dispatch(loginThunk({ email: 'u@test.com', password: 'pass' }));
    expect(action.type).toBe('auth/login/rejected');
    expect(store.getState().auth.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('rejects and clears state on api failure', async () => {
    mockedApi.login.mockRejectedValueOnce(new Error('bad credentials'));
    const store = buildStore();
    await store.dispatch(loginThunk({ email: 'u', password: 'p' }));
    expect(store.getState().auth.isLoading).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  it('marks isLoading=true while pending', () => {
    const state = authReducer(undefined, { type: loginThunk.pending.type });
    expect(state.isLoading).toBe(true);
  });
});

describe('logoutThunk', () => {
  beforeEach(() => {
    mockedApi.logout.mockReset();
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify(fakeUser));
  });

  it('clears state on success', async () => {
    mockedApi.logout.mockResolvedValueOnce();
    const store = buildStore();
    store.dispatch(setCredentials({ user: fakeUser, token: 'abc' }));
    await store.dispatch(logoutThunk());
    expect(store.getState().auth.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('clears state even if logout api throws', async () => {
    mockedApi.logout.mockRejectedValueOnce(new Error('network'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const store = buildStore();
    store.dispatch(setCredentials({ user: fakeUser, token: 'abc' }));
    await store.dispatch(logoutThunk());
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.token).toBeNull();
  });

  it('marks isLoading=true while pending and clears on rejected', () => {
    let state = authReducer(undefined, { type: logoutThunk.pending.type });
    expect(state.isLoading).toBe(true);
    state = authReducer(state, { type: logoutThunk.rejected.type });
    expect(state.isLoading).toBe(false);
    expect(state.user).toBeNull();
  });
});
