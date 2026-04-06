import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Employee, LoginCredentials } from '../types';
import apiService from '../services/api';
import type { RootState } from './index';

interface AuthState {
  user: Employee | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await apiService.login(credentials.email, credentials.password);

    if (!response || !response.user || !response.token) {
      throw new Error('Resposta de login inválida');
    }

    // Manter token no localStorage para o interceptor do axios
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return { user: response.user, token: response.token };
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setCredentials(state, action: PayloadAction<{ user: Employee; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      });
  },
});

export const { clearAuth, setCredentials } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user && !!state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer;
