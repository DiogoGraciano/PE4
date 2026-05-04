import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

const buildContext = (): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn(),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jest.clearAllMocks();
  });

  it('retorna true para rotas públicas', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const context = buildContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('delega para super.canActivate em rotas privadas', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    const context = buildContext();
    const result = guard.canActivate(context);

    expect(superCanActivate).toHaveBeenCalledWith(context);
    expect(result).toBe(true);
    superCanActivate.mockRestore();
  });

  it('delega para super.canActivate quando isPublic é undefined', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(false);

    const context = buildContext();
    const result = guard.canActivate(context);

    expect(result).toBe(false);
    superCanActivate.mockRestore();
  });
});
