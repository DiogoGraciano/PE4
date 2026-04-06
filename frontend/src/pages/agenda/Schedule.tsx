import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import Modal from '../../components/Modal';
import CalendarView, { EVENT_COLORS } from '../../components/CalendarView';
import EventForm, { emptyEventForm, type EventFormData } from './EventForm';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '../../hooks/useEvents';
import { useStudents } from '../../hooks/useStudents';
import { useCompanies } from '../../hooks/useCompanies';
import type { ScheduleEvent, EventType } from '../../types';

// Converte ISO/Date → "YYYY-MM-DDTHH:mm" para input datetime-local
const toLocalInput = (value: string | Date): string => {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface NewEventState {
  tipo?: EventType;
  aluno_id?: number;
  empresa_id?: number;
  titulo?: string;
}

const Schedule: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: events = [], isLoading } = useEvents();
  const { data: students = [] } = useStudents();
  const { data: companies = [] } = useCompanies();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ScheduleEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData>(emptyEventForm);

  // Auto-abre o modal quando vem com state pré-preenchido (ex: botão "Agendar Visita" na tela de alunos)
  useEffect(() => {
    const state = location.state as { newEvent?: NewEventState } | null;
    const preset = state?.newEvent;
    if (!preset) return;

    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    setEditing(null);
    setFormData({
      ...emptyEventForm,
      titulo: preset.titulo || '',
      tipo: preset.tipo || 'generico',
      aluno_id: preset.aluno_id ? preset.aluno_id.toString() : '',
      empresa_id: preset.empresa_id ? preset.empresa_id.toString() : '',
      data_inicio: toLocalInput(start),
      data_fim: toLocalInput(end),
    });
    setShowModal(true);

    // Limpa o state para não reabrir ao voltar
    navigate(location.pathname, { replace: true });
  }, [location, navigate]);

  const openNewEvent = (start?: Date, end?: Date) => {
    const startDate = start ?? new Date();
    const endDate = end ?? new Date(startDate.getTime() + 60 * 60 * 1000);
    setEditing(null);
    setFormData({
      ...emptyEventForm,
      data_inicio: toLocalInput(startDate),
      data_fim: toLocalInput(endDate),
    });
    setShowModal(true);
  };

  const openEditEvent = (id: number) => {
    const ev = events.find((e: ScheduleEvent) => e.id === id);
    if (!ev) return;
    setEditing(ev);
    setFormData({
      titulo: ev.titulo || '',
      descricao: ev.descricao || '',
      data_inicio: toLocalInput(ev.data_inicio),
      data_fim: toLocalInput(ev.data_fim),
      tipo: ev.tipo,
      local: ev.local || '',
      observacao: ev.observacao || '',
      aluno_id: ev.aluno_id ? ev.aluno_id.toString() : '',
      empresa_id: ev.empresa_id ? ev.empresa_id.toString() : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const payload: any = {
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim() || undefined,
      data_inicio: new Date(formData.data_inicio).toISOString(),
      data_fim: new Date(formData.data_fim).toISOString(),
      tipo: formData.tipo,
      local: formData.local.trim() || undefined,
      observacao: formData.observacao.trim() || undefined,
      aluno_id: formData.aluno_id ? parseInt(formData.aluno_id, 10) : undefined,
      empresa_id: formData.empresa_id
        ? parseInt(formData.empresa_id, 10)
        : undefined,
    };

    try {
      if (editing) {
        await updateEvent.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createEvent.mutateAsync(payload);
      }
      setShowModal(false);
      setEditing(null);
      setFormData(emptyEventForm);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await deleteEvent.mutateAsync(editing.id);
      setShowModal(false);
      setEditing(null);
      setFormData(emptyEventForm);
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Agende visitas a alunos, empresas ou eventos genéricos
          </p>
        </div>
        <button
          onClick={() => openNewEvent()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </button>
      </div>

      {/* Legenda de cores */}
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Legenda:</span>
          {(Object.keys(EVENT_COLORS) as EventType[]).map((tipo) => (
            <div key={tipo} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: EVENT_COLORS[tipo].bg }}
              />
              <span className="text-sm text-gray-600">
                {EVENT_COLORS[tipo].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendário */}
      <CalendarView
        events={events as ScheduleEvent[]}
        onSelectSlot={(start, end) => openNewEvent(start, end)}
        onSelectEvent={openEditEvent}
      />

      {/* Empty hint */}
      {events.length === 0 && (
        <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Nenhum evento cadastrado. Clique em um dia ou em "Novo Evento" para começar.
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Evento' : 'Novo Evento'}
        size="xl"
      >
        <EventForm
          formData={formData}
          onFormDataChange={setFormData}
          students={students}
          companies={companies}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          onDelete={handleDelete}
          isEditing={!!editing}
          isLoading={
            createEvent.isPending || updateEvent.isPending || deleteEvent.isPending
          }
        />
      </Modal>
    </div>
  );
};

export default Schedule;
