import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk, logoutThunk, selectUser, selectIsAuthenticated, selectAuthLoading } from '../store/authSlice';
import type { LoginCredentials } from '../types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

  const login = useCallback(async (credentials: LoginCredentials) => {
    await dispatch(loginThunk(credentials)).unwrap();
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutThunk()).unwrap();
  }, [dispatch]);

  return { user, isAuthenticated, isLoading, login, logout };
}
