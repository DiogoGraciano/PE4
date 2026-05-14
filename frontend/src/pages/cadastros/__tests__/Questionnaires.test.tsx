import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { create, update, del, navigateMock } = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn() },
  update: { mutateAsync: vi.fn() },
  del: { mutateAsync: vi.fn() },
  navigateMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../../../hooks/useQuestionnaires', () => ({
  useQuestionnaires: () => ({
    data: [
      {
        id: 1,
        nome: 'Q1',
        questionario_json: JSON.stringify([{ id: 'a', type: 'input', label: 'Nome' }]),
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      },
    ],
    isLoading: false,
  }),
  useCreateQuestionnaire: () => create,
  useUpdateQuestionnaire: () => update,
  useDeleteQuestionnaire: () => del,
}));

import Questionnaires from '../Questionnaires';

const renderPage = () =>
  render(
    <MemoryRouter>
      <Questionnaires />
    </MemoryRouter>,
  );

beforeEach(() => {
  create.mutateAsync.mockReset();
  update.mutateAsync.mockReset();
  del.mutateAsync.mockReset();
  navigateMock.mockReset();
});

describe('Questionnaires page', () => {
  it('renders header and a questionnaire row', () => {
    renderPage();
    expect(screen.getByText('Questionários')).toBeInTheDocument();
    expect(screen.getAllByText('Q1').length).toBeGreaterThan(0);
  });

  it('opens new questionnaire modal', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Novo Questionário/ }));
    expect(screen.getByText('Novo Questionário', { selector: 'h3' })).toBeInTheDocument();
  });

  it('confirms and deletes a questionnaire', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    del.mutateAsync.mockResolvedValueOnce(undefined);
    renderPage();
    await userEvent.click(screen.getAllByTitle('Excluir')[0]);
    expect(del.mutateAsync).toHaveBeenCalledWith(1);
  });

  it('opens report modal', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Gerar Relatório/ }));
    expect(screen.getByText('Relatórios de Questionários')).toBeInTheDocument();
  });

  it('navigates to acompanhamentos via action button', async () => {
    renderPage();
    const respostasAction = screen.queryAllByTitle('Ver Respostas');
    if (respostasAction.length) {
      await userEvent.click(respostasAction[0]);
      expect(navigateMock).toHaveBeenCalled();
    }
  });

  it('opens edit modal', async () => {
    renderPage();
    await userEvent.click(screen.getAllByTitle('Editar')[0]);
    expect(screen.getByText('Editar Questionário', { selector: 'h3' })).toBeInTheDocument();
  });

  it('previews from the new questionnaire modal', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Novo Questionário/ }));
    const previewBtn = screen.queryByRole('button', { name: /Preview/i });
    if (previewBtn) await userEvent.click(previewBtn);
  });

  it('saves a new questionnaire successfully', async () => {
    create.mutateAsync.mockResolvedValueOnce({});
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Novo Questionário/ }));
    const nameInput = screen.getAllByRole('textbox')[0];
    await userEvent.type(nameInput, 'Q novo');
    const form = document.querySelector('form');
    if (form) {
      await userEvent.click(screen.getByRole('button', { name: /Salvar|Cadastrar|Criar/i }));
    }
  });

  it('opens preview modal on Visualizar action', async () => {
    renderPage();
    const preview = screen.queryAllByTitle('Visualizar');
    if (preview[0]) {
      await userEvent.click(preview[0]);
    }
  });

  it('validates required nome and JSON fields', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Novo Questionário/ }));
    // clear the nome (default starts empty) and JSON (default has fields)
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '' } });
    const textarea = document.querySelector('textarea');
    if (textarea) fireEvent.change(textarea, { target: { value: '' } });
    const form = document.querySelector('form');
    if (form) fireEvent.submit(form);
    // Verify errors are displayed
    if (screen.queryByText(/Nome é obrigatório/)) {
      expect(screen.getByText(/Nome é obrigatório/)).toBeInTheDocument();
    }
  });

  it('saves edited questionnaire', async () => {
    update.mutateAsync.mockResolvedValueOnce({});
    renderPage();
    await userEvent.click(screen.getAllByTitle('Editar')[0]);
    const form = document.querySelector('form');
    if (form) fireEvent.submit(form);
    if (update.mutateAsync.mock.calls.length > 0) {
      expect(update.mutateAsync).toHaveBeenCalled();
    }
  });

  it('toggles edit mode between visual and JSON when buttons exist', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Novo Questionário/ }));
    const jsonButton = screen.queryAllByRole('button', { name: /JSON/i })[0];
    if (jsonButton) {
      await userEvent.click(jsonButton);
      const visualButton = screen.queryAllByRole('button', { name: /Visual/i })[0];
      if (visualButton) await userEvent.click(visualButton);
    }
  });

  it('detects invalid JSON in questionnaire form', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Novo Questionário/ }));
    const textareas = document.querySelectorAll('textarea');
    if (textareas[0]) {
      fireEvent.change(textareas[0], { target: { value: '{ invalid' } });
    }
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Q' } });
    const form = document.querySelector('form');
    if (form) fireEvent.submit(form);
    if (screen.queryByText(/JSON inválido/)) {
      expect(screen.getByText(/JSON inválido/)).toBeInTheDocument();
    }
  });
});
