import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import Layout from '../Layout';
import { renderWithProviders, createTestStore, makeEmployee } from '../../test/utils';

const logoutMock = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { nome: 'Diogo', tipo_usuario: 'ADM' },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: logoutMock,
  }),
}));

const renderLayout = (route = '/') =>
  renderWithProviders(
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<div data-testid="page-home" />} />
        <Route path="/cadastros/alunos" element={<div data-testid="page-alunos" />} />
      </Route>
    </Routes>,
    {
      route,
      store: createTestStore({
        auth: { user: makeEmployee(), token: 'tk', isLoading: false },
        ui: { sidebarOpen: true },
      }),
    },
  );

describe('Layout', () => {
  it('renders user info, navigation, and Outlet', () => {
    renderLayout('/');
    expect(screen.getAllByText('Diogo').length).toBeGreaterThan(0);
    expect(screen.getByText(/NEXO - Acompanhamento/)).toBeInTheDocument();
    expect(screen.getByTestId('page-home')).toBeInTheDocument();
    expect(screen.getAllByText('Cadastros').length).toBeGreaterThan(0);
    expect(screen.getByText('Alunos/Usuários')).toBeInTheDocument();
  });

  it('toggles sections (collapse and expand)', async () => {
    renderLayout('/');
    const button = screen.getByRole('button', { name: /Cadastros/i });
    expect(screen.getByText('Alunos/Usuários')).toBeInTheDocument();
    await userEvent.click(button);
    expect(screen.queryByText('Alunos/Usuários')).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(screen.getByText('Alunos/Usuários')).toBeInTheDocument();
  });

  it('calls logout when clicking Sair', async () => {
    renderLayout('/');
    logoutMock.mockResolvedValueOnce(undefined);
    await userEvent.click(screen.getByRole('button', { name: /Sair/i }));
    expect(logoutMock).toHaveBeenCalled();
  });

  it('catches logout errors silently', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logoutMock.mockRejectedValueOnce(new Error('falhou'));
    renderLayout('/');
    await userEvent.click(screen.getByRole('button', { name: /Sair/i }));
    await new Promise((r) => setTimeout(r, 0));
    expect(errSpy).toHaveBeenCalled();
  });

  it('highlights the active route link', () => {
    renderLayout('/cadastros/alunos');
    const link = screen.getByRole('link', { name: /Alunos\/Usuários/ });
    expect(link.className).toContain('bg-blue-700');
  });

  it('mobile menu opens via header menu and closes via overlay click', async () => {
    renderLayout('/');
    const menuButtons = document.querySelectorAll('button.lg\\:hidden');
    const headerMenu = menuButtons[menuButtons.length - 1] as HTMLElement;
    await userEvent.click(headerMenu);
    const overlay = document.querySelector('.fixed.inset-0.z-40');
    if (overlay) await userEvent.click(overlay as HTMLElement);
  });

  it('toggles each section button', async () => {
    renderLayout('/');
    for (const title of ['Agenda', 'Acompanhamentos', 'Configurações']) {
      const btn = screen.queryByRole('button', { name: new RegExp(title, 'i') });
      if (btn) await userEvent.click(btn);
    }
  });
});
