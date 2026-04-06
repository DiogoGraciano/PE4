import type {
  Student,
  Company,
  Referral,
  Questionnaire,
  QuestionnaireResponse,
  ScheduleEvent,
  EventType,
} from '../../types';

export interface MonthBucket {
  month: string;
  alunos: number;
  empresas: number;
  encaminhamentos: number;
}

export interface PlacementStats {
  placed: number;
  terminated: number;
  unplaced: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface EventTypeCount {
  type: EventType;
  label: string;
  count: number;
}

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  visita_aluno: 'Visita Aluno',
  visita_empresa: 'Visita Empresa',
  visita_ambos: 'Visita Ambos',
  generico: 'Genérico',
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
}

/**
 * Builds the last `months` monthly buckets (oldest first) and counts
 * how many items in each list fall in each bucket based on `created_at`.
 */
export function buildGrowthTrend(
  students: Student[],
  companies: Company[],
  referrals: Referral[],
  months = 12
): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  const indexByKey = new Map<string, number>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    indexByKey.set(key, buckets.length);
    buckets.push({
      month: monthLabel(d),
      alunos: 0,
      empresas: 0,
      encaminhamentos: 0,
    });
  }

  const accumulate = (
    items: Array<{ created_at?: string }>,
    field: 'alunos' | 'empresas' | 'encaminhamentos'
  ) => {
    for (const item of items) {
      if (!item.created_at) continue;
      const d = new Date(item.created_at);
      if (Number.isNaN(d.getTime())) continue;
      const key = monthKey(d);
      const idx = indexByKey.get(key);
      if (idx !== undefined) buckets[idx][field] += 1;
    }
  };

  accumulate(students, 'alunos');
  accumulate(companies, 'empresas');
  accumulate(referrals, 'encaminhamentos');

  return buckets;
}

/**
 * Computes how many students are currently placed, terminated, or unplaced.
 * - placed: aluno tem ao menos 1 referral SEM data_desligamento
 * - terminated: aluno NÃO tem referral ativo, mas tem ao menos 1 com data_desligamento
 * - unplaced: aluno não tem nenhum referral
 */
export function placementStats(
  students: Student[],
  referrals: Referral[]
): PlacementStats {
  const studentRefs = new Map<number, Referral[]>();
  for (const r of referrals) {
    const list = studentRefs.get(r.aluno_id) ?? [];
    list.push(r);
    studentRefs.set(r.aluno_id, list);
  }

  let placed = 0;
  let terminated = 0;
  let unplaced = 0;

  for (const s of students) {
    if (s.id === undefined) continue;
    const refs = studentRefs.get(s.id);
    if (!refs || refs.length === 0) {
      unplaced += 1;
      continue;
    }
    const hasActive = refs.some(r => !r.data_desligamento);
    if (hasActive) placed += 1;
    else terminated += 1;
  }

  return { placed, terminated, unplaced };
}

/**
 * Top N companies by referral count.
 */
export function topCompanies(
  referrals: Referral[],
  companies: Company[],
  n = 5
): NamedCount[] {
  const counts = new Map<number, number>();
  for (const r of referrals) {
    counts.set(r.empresa_id, (counts.get(r.empresa_id) ?? 0) + 1);
  }

  const companyById = new Map(companies.map(c => [c.id, c]));

  return Array.from(counts.entries())
    .map(([id, count]) => {
      const c = companyById.get(id);
      const fullName = c?.razao_social ?? `Empresa #${id}`;
      const name = fullName.length > 22 ? `${fullName.slice(0, 22)}…` : fullName;
      return { name, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Top N states by student count.
 */
export function studentsByState(students: Student[], n = 6): NamedCount[] {
  const counts = new Map<string, number>();
  for (const s of students) {
    const uf = (s.estado ?? '').trim().toUpperCase();
    if (!uf) continue;
    counts.set(uf, (counts.get(uf) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Distribution of events by type. Always returns the 4 known types
 * (with 0 count if absent) so the chart looks stable.
 */
export function eventsByType(events: ScheduleEvent[]): EventTypeCount[] {
  const types: EventType[] = [
    'visita_aluno',
    'visita_empresa',
    'visita_ambos',
    'generico',
  ];
  const counts = new Map<EventType, number>();
  for (const t of types) counts.set(t, 0);
  for (const ev of events) {
    counts.set(ev.tipo, (counts.get(ev.tipo) ?? 0) + 1);
  }
  return types.map(t => ({
    type: t,
    label: EVENT_TYPE_LABELS[t],
    count: counts.get(t) ?? 0,
  }));
}

/**
 * Number of responses received per questionnaire.
 */
export function responsesPerQuestionnaire(
  questionnaires: Questionnaire[],
  responses: QuestionnaireResponse[]
): NamedCount[] {
  const counts = new Map<number, number>();
  for (const r of responses) {
    counts.set(r.questionario_id, (counts.get(r.questionario_id) ?? 0) + 1);
  }
  return questionnaires
    .map(q => {
      const name = q.nome.length > 22 ? `${q.nome.slice(0, 22)}…` : q.nome;
      return { name, count: counts.get(q.id) ?? 0 };
    })
    .sort((a, b) => b.count - a.count);
}

/**
 * Most recent referrals (descending by created_at).
 */
export function recentReferrals(referrals: Referral[], n = 5): Referral[] {
  return [...referrals]
    .filter(r => r.created_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, n);
}

/**
 * Referrals whose data_desligamento falls within the next `days` days.
 */
export function studentsNearTermination(
  referrals: Referral[],
  days = 30
): Referral[] {
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return referrals.filter(r => {
    if (!r.data_desligamento) return false;
    const d = new Date(r.data_desligamento);
    if (Number.isNaN(d.getTime())) return false;
    return d >= now && d <= limit;
  });
}

/**
 * Events scheduled for today or later.
 */
export function upcomingEvents(events: ScheduleEvent[]): ScheduleEvent[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return events.filter(e => {
    if (!e.data_inicio) return false;
    const d = new Date(e.data_inicio);
    if (Number.isNaN(d.getTime())) return false;
    return d >= now;
  });
}
