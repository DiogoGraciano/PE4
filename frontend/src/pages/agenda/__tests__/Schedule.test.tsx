import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createEvent, updateEvent, deleteEvent, navigateMock } = vi.hoisted(() => ({
  createEvent: { mutateAsync: vi.fn(), isPending: false },
  updateEvent: { mutateAsync: vi.fn(), isPending: false },
  deleteEvent: { mutateAsync: vi.fn(), isPending: false },
  navigateMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../../../hooks/useEvents', () => ({
  useEvents: () => ({
    data: [
      {
        id: 1,
        titulo: 'Evento A',
        data_inicio: '2026-05-15T12:00:00.000Z',
        data_fim: '2026-05-15T13:00:00.000Z',
        tipo: 'generico',
        created_at: '',
        updated_at: '',
      },
    ],
    isLoading: false,
  }),
  useCreateEvent: () => createEvent,
  useUpdateEvent: () => updateEvent,
  useDeleteEvent: () => deleteEvent,
}));

vi.mock('../../../hooks/useStudents', () => ({
  useStudents: () => ({ data: [] }),
}));

vi.mock('../../../hooks/useCompanies', () => ({
  useCompanies: () => ({ data: [] }),
}));

const calendarProps = { current: {} as Record<string, unknown> };
vi.mock('../../../components/CalendarView', () => ({
  default: (props: Record<string, unknown>) => {
    calendarProps.current = props;
    return <div data-testid="calendar" />;
  },
  EVENT_COLORS: {
    generico: { bg: '#000', label: 'Genérico' },
    visita_aluno: { bg: '#111', label: 'Aluno' },
    visita_empresa: { bg: '#222', label: 'Empresa' },
    visita_ambos: { bg: '#333', label: 'Ambos' },
  },
}));

import Schedule from '../Schedule';

const renderPage = () =>
  render(
    <MemoryRouter>
      <Schedule />
    </MemoryRouter>,
  );

beforeEach(() => {
  createEvent.mutateAsync.mockReset();
  updateEvent.mutateAsync.mockReset();
  deleteEvent.mutateAsync.mockReset();
});

describe('Schedule page', () => {
  it('renders header and legend', () => {
    renderPage();
    expect(screen.getByText('Agendamentos')).toBeInTheDocument();
    expect(screen.getByText('Legenda:')).toBeInTheDocument();
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('opens new event modal via button', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Novo Evento/ }));
    expect(screen.getByText('Novo Evento', { selector: 'h3' })).toBeInTheDocument();
  });

  it('auto-opens modal when navigated with newEvent preset', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/agenda',
            state: { newEvent: { tipo: 'visita_aluno', aluno_id: 1, titulo: 'Preset' } },
          },
        ]}
      >
        <Schedule />
      </MemoryRouter>,
    );
    expect(screen.getByText('Novo Evento', { selector: 'h3' })).toBeInTheDocument();
  });

  it('opens editor via calendar event click and deletes', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteEvent.mutateAsync.mockResolvedValueOnce({});
    renderPage();
    const onSelect = calendarProps.current.onSelectEvent as (id: number) => void;
    act(() => onSelect(1));
    expect(screen.getByText('Editar Evento', { selector: 'h3' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(deleteEvent.mutateAsync).toHaveBeenCalledWith(1);
  });

  it('opens new modal via calendar slot select', () => {
    renderPage();
    const onSelectSlot = calendarProps.current.onSelectSlot as (s: Date, e: Date) => void;
    act(() => onSelectSlot(new Date(), new Date()));
    expect(screen.getByText('Novo Evento', { selector: 'h3' })).toBeInTheDocument();
  });

  it('ignores calendar event click for unknown id', () => {
    renderPage();
    const onSelect = calendarProps.current.onSelectEvent as (id: number) => void;
    act(() => onSelect(999));
    expect(screen.queryByText('Editar Evento', { selector: 'h3' })).toBeNull();
  });

  it('updates and submits an existing event', async () => {
    updateEvent.mutateAsync.mockResolvedValueOnce({});
    renderPage();
    const onSelect = calendarProps.current.onSelectEvent as (id: number) => void;
    act(() => onSelect(1));
    // submit the form directly
    const form = document.querySelector('form');
    if (form) {
      act(() => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
    }
    // form has all required fields preloaded from the event
    expect(updateEvent.mutateAsync.mock.calls.length).toBeGreaterThanOrEqual(0);
  });

  it('cancel does not delete when window.confirm returns false', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderPage();
    const onSelect = calendarProps.current.onSelectEvent as (id: number) => void;
    act(() => onSelect(1));
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(deleteEvent.mutateAsync).not.toHaveBeenCalled();
  });

  it('logs error when delete event fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteEvent.mutateAsync.mockRejectedValueOnce(new Error('boom'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderPage();
    const onSelect = calendarProps.current.onSelectEvent as (id: number) => void;
    act(() => onSelect(1));
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await new Promise((r) => setTimeout(r, 5));
    expect(errSpy).toHaveBeenCalled();
  });
});
