import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';

const mockAuthService = {
  validateEmployee: jest.fn(),
};

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    jest.clearAllMocks();
  });

  it('retorna funcionário quando credenciais são válidas', async () => {
    const employee = { id: 1, email: 'a@a.com' };
    mockAuthService.validateEmployee.mockResolvedValue(employee);

    const result = await strategy.validate('a@a.com', 'pass');
    expect(result).toEqual(employee);
  });

  it('lança UnauthorizedException quando credenciais são inválidas', async () => {
    mockAuthService.validateEmployee.mockResolvedValue(null);
    await expect(strategy.validate('a@a.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
