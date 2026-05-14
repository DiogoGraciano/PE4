import { describe, expect, it } from 'vitest';
import { ROLE_PERMISSIONS } from './rolePermissions';

describe('ROLE_PERMISSIONS', () => {
  it('declares the 5 expected roles', () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual(['ADM', 'COORD', 'DIR', 'PROF', 'RH']);
  });

  it('grants ADM the SMTP config permission', () => {
    expect(ROLE_PERMISSIONS.ADM).toContain('Configuração SMTP');
  });

  it('restricts non-admin roles from SMTP config', () => {
    for (const role of ['RH', 'COORD', 'PROF', 'DIR']) {
      expect(ROLE_PERMISSIONS[role]).not.toContain('Configuração SMTP');
    }
  });

  it('lets RH manage employees', () => {
    expect(ROLE_PERMISSIONS.RH).toContain('Funcionários (criar, editar, listar, excluir)');
  });

  it('lets COORD/PROF/DIR access questionnaires', () => {
    for (const role of ['COORD', 'PROF', 'DIR']) {
      expect(ROLE_PERMISSIONS[role]).toContain(
        'Questionários, perguntas e respostas (criar, editar, listar, excluir)',
      );
    }
  });
});
