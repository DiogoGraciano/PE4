import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildGrowthTrend,
  placementStats,
  topCompanies,
  studentsByState,
  eventsByType,
  responsesPerQuestionnaire,
  recentReferrals,
  studentsNearTermination,
  upcomingEvents,
} from './dashboardHelpers';
import type {
  Student,
  Company,
  Referral,
  Questionnaire,
  QuestionnaireResponse,
  ScheduleEvent,
} from '../../types';

const FIXED_NOW = new Date('2026-05-15T12:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

const baseStudent = (overrides: Partial<Student> = {}): Student => ({
  id: 1,
  codigo: 'A001',
  responsavel: 'Resp',
  ...overrides,
});

const baseCompany = (overrides: Partial<Company> = {}): Company => ({
  id: 1,
  razao_social: 'Empresa',
  cnpj: '00',
  cep: '',
  cidade: '',
  estado: '',
  bairro: '',
  pais: '',
  numero_endereco: '',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  ...overrides,
});

const baseReferral = (overrides: Partial<Referral> = {}): Referral => ({
  id: 1,
  aluno_id: 1,
  empresa_id: 1,
  created_at: '2026-05-15T12:00:00.000Z',
  updated_at: '2026-05-15T12:00:00.000Z',
  ...overrides,
});

describe('buildGrowthTrend', () => {
  it('returns last 12 buckets by default in chronological order', () => {
    const result = buildGrowthTrend([], [], []);
    expect(result).toHaveLength(12);
    expect(result[0].month).toMatch(/\/25$/);
    expect(result[11].month).toMatch(/\/26$/);
    result.forEach((b) => {
      expect(b.alunos).toBe(0);
      expect(b.empresas).toBe(0);
      expect(b.encaminhamentos).toBe(0);
    });
  });

  it('accepts custom months length', () => {
    const result = buildGrowthTrend([], [], [], 3);
    expect(result).toHaveLength(3);
  });

  it('counts items in correct month buckets', () => {
    const students: Student[] = [
      baseStudent({ id: 1, created_at: '2026-05-10T15:00:00.000Z' }),
      baseStudent({ id: 2, created_at: '2026-04-10T15:00:00.000Z' }),
    ];
    const companies: Company[] = [baseCompany({ id: 1, created_at: '2026-05-15T12:00:00.000Z' })];
    const referrals: Referral[] = [
      baseReferral({ id: 1, created_at: '2026-05-15T12:00:00.000Z' }),
      baseReferral({ id: 2, created_at: '2026-05-20T12:00:00.000Z' }),
    ];

    const result = buildGrowthTrend(students, companies, referrals, 12);
    const may = result[11];
    const april = result[10];
    expect(may.alunos).toBe(1);
    expect(may.empresas).toBe(1);
    expect(may.encaminhamentos).toBe(2);
    expect(april.alunos).toBe(1);
  });

  it('ignores items without created_at or with invalid dates', () => {
    const students: Student[] = [
      baseStudent({ id: 1 }),
      baseStudent({ id: 2, created_at: 'not-a-date' }),
    ];
    const result = buildGrowthTrend(students, [], []);
    const total = result.reduce((acc, b) => acc + b.alunos, 0);
    expect(total).toBe(0);
  });

  it('ignores items outside the time window', () => {
    const students: Student[] = [baseStudent({ id: 1, created_at: '2020-01-01T00:00:00.000Z' })];
    const result = buildGrowthTrend(students, [], [], 3);
    const total = result.reduce((acc, b) => acc + b.alunos, 0);
    expect(total).toBe(0);
  });
});

describe('placementStats', () => {
  it('classifies students as placed, terminated, unplaced', () => {
    const students = [
      baseStudent({ id: 1 }),
      baseStudent({ id: 2 }),
      baseStudent({ id: 3 }),
      baseStudent({ id: 4 }),
    ];
    const referrals = [
      baseReferral({ id: 1, aluno_id: 1 }),
      baseReferral({ id: 2, aluno_id: 2, data_desligamento: '2026-04-01' }),
      baseReferral({ id: 3, aluno_id: 2 }),
      baseReferral({ id: 4, aluno_id: 3, data_desligamento: '2026-04-01' }),
    ];
    const result = placementStats(students, referrals);
    expect(result).toEqual({ placed: 2, terminated: 1, unplaced: 1 });
  });

  it('skips students without id', () => {
    const students = [baseStudent({ id: undefined as unknown as number })];
    expect(placementStats(students, [])).toEqual({ placed: 0, terminated: 0, unplaced: 0 });
  });
});

describe('topCompanies', () => {
  it('orders by count desc and truncates long names', () => {
    const companies = [
      baseCompany({ id: 1, razao_social: 'A'.repeat(30) }),
      baseCompany({ id: 2, razao_social: 'B Short' }),
    ];
    const referrals = [
      baseReferral({ id: 1, empresa_id: 1 }),
      baseReferral({ id: 2, empresa_id: 1 }),
      baseReferral({ id: 3, empresa_id: 2 }),
    ];
    const result = topCompanies(referrals, companies);
    expect(result).toHaveLength(2);
    expect(result[0].count).toBe(2);
    expect(result[0].name).toHaveLength(23);
    expect(result[0].name.endsWith('…')).toBe(true);
    expect(result[1].name).toBe('B Short');
  });

  it('falls back to placeholder name when company not found', () => {
    const referrals = [baseReferral({ id: 1, empresa_id: 99 })];
    const result = topCompanies(referrals, []);
    expect(result[0].name).toBe('Empresa #99');
  });

  it('respects n parameter', () => {
    const companies = Array.from({ length: 10 }, (_, i) =>
      baseCompany({ id: i + 1, razao_social: `C${i}` }),
    );
    const referrals = Array.from({ length: 10 }, (_, i) =>
      baseReferral({ id: i + 1, empresa_id: i + 1 }),
    );
    expect(topCompanies(referrals, companies, 3)).toHaveLength(3);
  });
});

describe('studentsByState', () => {
  it('groups, normalizes to upper-case, skips empty', () => {
    const students = [
      baseStudent({ id: 1, estado: 'sp' }),
      baseStudent({ id: 2, estado: 'SP' }),
      baseStudent({ id: 3, estado: 'rj' }),
      baseStudent({ id: 4, estado: '' }),
      baseStudent({ id: 5 }),
    ];
    const result = studentsByState(students);
    expect(result).toEqual([
      { name: 'SP', count: 2 },
      { name: 'RJ', count: 1 },
    ]);
  });

  it('limits results to N', () => {
    const students = Array.from({ length: 10 }, (_, i) =>
      baseStudent({ id: i + 1, estado: `S${i}` }),
    );
    expect(studentsByState(students, 3)).toHaveLength(3);
  });
});

describe('eventsByType', () => {
  const makeEvt = (tipo: ScheduleEvent['tipo']): ScheduleEvent => ({
    id: Math.random(),
    titulo: 't',
    data_inicio: '2026-06-01',
    data_fim: '2026-06-01',
    tipo,
    created_at: '2026-06-01',
    updated_at: '2026-06-01',
  });

  it('always returns four buckets with labels', () => {
    const result = eventsByType([]);
    expect(result.map((r) => r.type)).toEqual([
      'visita_aluno',
      'visita_empresa',
      'visita_ambos',
      'generico',
    ]);
    expect(result.every((r) => r.count === 0)).toBe(true);
    expect(result[0].label).toBe('Visita Aluno');
  });

  it('counts events by type', () => {
    const result = eventsByType([
      makeEvt('visita_aluno'),
      makeEvt('visita_aluno'),
      makeEvt('generico'),
    ]);
    expect(result.find((r) => r.type === 'visita_aluno')?.count).toBe(2);
    expect(result.find((r) => r.type === 'generico')?.count).toBe(1);
    expect(result.find((r) => r.type === 'visita_empresa')?.count).toBe(0);
  });
});

describe('responsesPerQuestionnaire', () => {
  it('aggregates responses and truncates long names; sorts desc', () => {
    const questionnaires: Questionnaire[] = [
      {
        id: 1,
        nome: 'Q'.repeat(30),
        questionario_json: '[]',
        created_at: '',
        updated_at: '',
      },
      { id: 2, nome: 'Short', questionario_json: '[]', created_at: '', updated_at: '' },
    ];
    const responses: QuestionnaireResponse[] = [
      {
        id: 1,
        questionario_id: 1,
        aluno_id: 1,
        respostas_json: '{}',
        data_envio: '',
        created_at: '',
        updated_at: '',
      },
      {
        id: 2,
        questionario_id: 1,
        aluno_id: 2,
        respostas_json: '{}',
        data_envio: '',
        created_at: '',
        updated_at: '',
      },
      {
        id: 3,
        questionario_id: 2,
        aluno_id: 3,
        respostas_json: '{}',
        data_envio: '',
        created_at: '',
        updated_at: '',
      },
    ];

    const result = responsesPerQuestionnaire(questionnaires, responses);
    expect(result[0].count).toBe(2);
    expect(result[0].name.endsWith('…')).toBe(true);
    expect(result[1]).toEqual({ name: 'Short', count: 1 });
  });
});

describe('recentReferrals', () => {
  it('orders by created_at desc and skips items without timestamp', () => {
    const refs = [
      baseReferral({ id: 1, created_at: '2026-05-01T12:00:00.000Z' }),
      baseReferral({ id: 2, created_at: '2026-05-10T12:00:00.000Z' }),
      baseReferral({ id: 3, created_at: '' }),
    ];
    const result = recentReferrals(refs);
    expect(result.map((r) => r.id)).toEqual([2, 1]);
  });

  it('slices to N', () => {
    const refs = Array.from({ length: 10 }, (_, i) =>
      baseReferral({ id: i + 1, created_at: `2026-05-${String(i + 1).padStart(2, '0')}T12:00:00.000Z` }),
    );
    expect(recentReferrals(refs, 2)).toHaveLength(2);
  });
});

describe('studentsNearTermination', () => {
  it('returns referrals with termination within window', () => {
    const refs = [
      baseReferral({ id: 1, data_desligamento: '2026-05-20' }),
      baseReferral({ id: 2, data_desligamento: '2026-09-01' }),
      baseReferral({ id: 3 }),
      baseReferral({ id: 4, data_desligamento: 'invalid' }),
      baseReferral({ id: 5, data_desligamento: '2026-05-10' }),
    ];
    const result = studentsNearTermination(refs, 30);
    expect(result.map((r) => r.id)).toEqual([1]);
  });
});

describe('upcomingEvents', () => {
  it('returns events from today onward and skips invalid dates', () => {
    const events: ScheduleEvent[] = [
      {
        id: 1,
        titulo: 'past',
        data_inicio: '2026-05-10T10:00:00.000Z',
        data_fim: '2026-05-10T11:00:00.000Z',
        tipo: 'generico',
        created_at: '',
        updated_at: '',
      },
      {
        id: 2,
        titulo: 'today',
        data_inicio: '2026-05-15T18:00:00.000Z',
        data_fim: '2026-05-15T19:00:00.000Z',
        tipo: 'generico',
        created_at: '',
        updated_at: '',
      },
      {
        id: 3,
        titulo: 'future',
        data_inicio: '2026-06-01T10:00:00.000Z',
        data_fim: '2026-06-01T11:00:00.000Z',
        tipo: 'generico',
        created_at: '',
        updated_at: '',
      },
      {
        id: 4,
        titulo: 'no date',
        data_inicio: '',
        data_fim: '',
        tipo: 'generico',
        created_at: '',
        updated_at: '',
      },
      {
        id: 5,
        titulo: 'invalid',
        data_inicio: 'not-a-date',
        data_fim: '',
        tipo: 'generico',
        created_at: '',
        updated_at: '',
      },
    ];
    const result = upcomingEvents(events);
    expect(result.map((e) => e.id)).toEqual([2, 3]);
  });
});
