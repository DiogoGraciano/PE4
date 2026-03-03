/**
 * Permissões por regra (cargo), alinhado à matriz de autorização do backend.
 * Chave = Function.codigo (ADM, PROF, COORD, RH, DIR).
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADM: [
    'Funcionários (criar, editar, listar, excluir)',
    'Alunos (criar, editar, listar, excluir)',
    'Empresas (criar, editar, listar, excluir)',
    'Cargos (criar, editar, listar, excluir)',
    'Questionários, perguntas e respostas (criar, editar, listar, excluir)',
    'Configuração SMTP',
  ],
  RH: [
    'Funcionários (criar, editar, listar, excluir)',
    'Alunos (criar, editar, listar, excluir)',
    'Empresas (criar, editar, listar, excluir)',
  ],
  COORD: [
    'Alunos (criar, editar, listar, excluir)',
    'Questionários, perguntas e respostas (criar, editar, listar, excluir)',
  ],
  PROF: [
    'Alunos (criar, editar, listar, excluir)',
    'Questionários, perguntas e respostas (criar, editar, listar, excluir)',
  ],
  DIR: [
    'Alunos (criar, editar, listar, excluir)',
    'Questionários, perguntas e respostas (criar, editar, listar, excluir)',
  ],
};
