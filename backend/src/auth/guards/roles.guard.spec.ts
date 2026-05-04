import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Role } from '../roles/role.enum';

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

const buildContext = (user?: any): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    jest.clearAllMocks();
  });

  it('permite quando não há roles requeridas', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);
    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('permite quando usuário tem o role correto', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADM]);
    const user = { funcao: { codigo: Role.ADM } };
    expect(guard.canActivate(buildContext(user))).toBe(true);
  });

  it('lança ForbiddenException quando usuário não tem o role correto', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADM]);
    const user = { funcao: { codigo: Role.PROF } };
    expect(() => guard.canActivate(buildContext(user))).toThrow(ForbiddenException);
  });

  it('lança ForbiddenException quando usuário não tem funcao', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADM]);
    const user = {};
    expect(() => guard.canActivate(buildContext(user))).toThrow(ForbiddenException);
  });

  it('lança ForbiddenException quando não há usuário no request', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADM]);
    expect(() => guard.canActivate(buildContext(undefined))).toThrow(ForbiddenException);
  });
});
