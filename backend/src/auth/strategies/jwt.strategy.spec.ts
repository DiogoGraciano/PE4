import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { Employee } from '../../employees/entities/employee.entity';

const mockEmployeeRepo = {
  findOne: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_SECRET') return 'test-secret';
    return undefined;
  }),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
  });

  it('lança erro quando JWT_SECRET não está configurado', () => {
    const badConfigService = { get: jest.fn().mockReturnValue(undefined) };
    expect(
      () =>
        new JwtStrategy(badConfigService as any, mockEmployeeRepo as any),
    ).toThrow('JWT_SECRET não configurado');
  });

  it('retorna funcionário quando payload é válido', async () => {
    const mockEmployee = { id: 1, email: 'a@a.com', funcao: { codigo: 'ADM' } };
    mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);

    const result = await strategy.validate({ sub: 1, email: 'a@a.com' });
    expect(result).toEqual(mockEmployee);
  });

  it('lança UnauthorizedException quando funcionário não existe', async () => {
    mockEmployeeRepo.findOne.mockResolvedValue(null);
    await expect(strategy.validate({ sub: 999, email: 'x@x.com' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
