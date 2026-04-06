import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  EventClickArg,
  DateSelectArg,
  EventInput,
} from '@fullcalendar/core';
import type { ScheduleEvent, EventType } from '../types';

export const EVENT_COLORS: Record<EventType, { bg: string; label: string }> = {
  visita_aluno: { bg: '#3b82f6', label: 'Visita ao Aluno' },
  visita_empresa: { bg: '#10b981', label: 'Visita à Empresa' },
  visita_ambos: { bg: '#8b5cf6', label: 'Visita Aluno + Empresa' },
  generico: { bg: '#6b7280', label: 'Evento Genérico' },
};

interface CalendarViewProps {
  events: ScheduleEvent[];
  onSelectSlot: (start: Date, end: Date) => void;
  onSelectEvent: (id: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectSlot,
  onSelectEvent,
}) => {
  const fcEvents: EventInput[] = events.map((e) => {
    const color = EVENT_COLORS[e.tipo]?.bg || EVENT_COLORS.generico.bg;
    return {
      id: e.id.toString(),
      title: e.titulo,
      start: e.data_inicio,
      end: e.data_fim,
      backgroundColor: color,
      borderColor: color,
      textColor: '#ffffff',
      extendedProps: { tipo: e.tipo },
    };
  });

  const handleDateSelect = (arg: DateSelectArg) => {
    onSelectSlot(arg.start, arg.end);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const id = parseInt(arg.event.id, 10);
    if (!isNaN(id)) onSelectEvent(id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="pt-br"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
        }}
        allDayText="Dia inteiro"
        firstDay={0}
        height="auto"
        selectable
        selectMirror
        dayMaxEvents
        nowIndicator
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        events={fcEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
      />
    </div>
  );
};

export default CalendarView;
