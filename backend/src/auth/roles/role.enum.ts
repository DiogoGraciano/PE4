/**
 * Códigos de cargo (regra) alinhados com FunctionSeeder / tabela funcoes.
 * Usado pelo RolesGuard para autorização RBAC.
 */
export enum Role {
  ADM = 'ADM',
  PROF = 'PROF',
  COORD = 'COORD',
  RH = 'RH',
  DIR = 'DIR',
}
