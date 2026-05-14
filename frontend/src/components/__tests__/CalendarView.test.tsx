import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

let lastProps: Record<string, unknown> | null = null;

vi.mock('@fullcalendar/react', () => ({
  default: (props: Record<string, unknown>) => {
    lastProps = props;
    return <div data-testid="fc" />;
  },
}));
vi.mock('@fullcalendar/daygrid', () => ({ default: { name: 'dayGrid' } }));
vi.mock('@fullcalendar/timegrid', () => ({ default: { name: 'timeGrid' } }));
vi.mock('@fullcalendar/interaction', () => ({ default: { name: 'interaction' } }));

import CalendarView, { EVENT_COLORS } from '../CalendarView';
import { makeScheduleEvent } from '../../test/utils';

describe('CalendarView', () => {
  it('exposes EVENT_COLORS for all event types', () => {
    expect(Object.keys(EVENT_COLORS).sort()).toEqual(
      ['generico', 'visita_aluno', 'visita_ambos', 'visita_empresa'],
    );
  });

  it('maps events to FullCalendar events with colors', () => {
    const events = [
      makeScheduleEvent({ id: 7, tipo: 'visita_aluno', titulo: 'Visita' }),
      makeScheduleEvent({ id: 8, tipo: 'generico', titulo: 'Outro' }),
    ];
    render(
      <CalendarView events={events} onSelectSlot={vi.fn()} onSelectEvent={vi.fn()} />,
    );
    const fcEvents = (lastProps?.events as Array<Record<string, unknown>>) ?? [];
    expect(fcEvents).toHaveLength(2);
    expect(fcEvents[0]).toMatchObject({
      id: '7',
      title: 'Visita',
      backgroundColor: EVENT_COLORS.visita_aluno.bg,
    });
  });

  it('handles select and event click', () => {
    const onSelectSlot = vi.fn();
    const onSelectEvent = vi.fn();
    render(
      <CalendarView
        events={[makeScheduleEvent({ id: 1 })]}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
      />,
    );
    const start = new Date();
    const end = new Date();
    (lastProps?.select as (a: { start: Date; end: Date }) => void)({ start, end });
    expect(onSelectSlot).toHaveBeenCalledWith(start, end);

    (lastProps?.eventClick as (a: { event: { id: string } }) => void)({ event: { id: '42' } });
    expect(onSelectEvent).toHaveBeenCalledWith(42);

    onSelectEvent.mockClear();
    (lastProps?.eventClick as (a: { event: { id: string } }) => void)({ event: { id: 'NaN' } });
    expect(onSelectEvent).not.toHaveBeenCalled();
  });
});
