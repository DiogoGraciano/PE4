import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Employee } from '../employees/entities/employee.entity';
import { SmtpConfigService } from '../smtp-config/smtp-config.service';

const mockEmployeeRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockConfigService = {
  get: jest.fn((key: string) =>
    ({ FRONTEND_URL: 'http://localhost:5173' })[key],
  ),
};

const mockSmtpConfigService = {
  sendEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SmtpConfigService, useValue: mockSmtpConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('validateEmployee', () => {
    it('retorna null quando funcionário não existe', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      const result = await service.validateEmployee('test@test.com', 'pass');
      expect(result).toBeNull();
    });

    it('retorna null quando senha é inválida', async () => {
      const mockEmployee = {
        email: 'test@test.com',
        senha: 'hashed',
        validatePassword: jest.fn().mockResolvedValue(false),
      };
      mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      const result = await service.validateEmployee('test@test.com', 'wrong');
      expect(result).toBeNull();
    });

    it('retorna funcionário sem senha quando credenciais são válidas', async () => {
      const mockEmployee = {
        id: 1,
        email: 'test@test.com',
        nome: 'Test',
        senha: 'hashed',
        funcao: { codigo: 'ADM' },
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      const result = await service.validateEmployee('test@test.com', 'pass');
      expect(result).not.toHaveProperty('senha');
      expect(result.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('lança UnauthorizedException quando credenciais inválidas', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'a@a.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('retorna token e usuário quando credenciais válidas', async () => {
      const mockEmployee = {
        id: 1,
        email: 'a@a.com',
        nome: 'Test',
        senha: 'hashed',
        funcao: { codigo: 'ADM' },
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      const result = await service.login({ email: 'a@a.com', password: 'pass' });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'a@a.com',
        sub: 1,
      });
    });
  });

  describe('logout', () => {
    it('retorna mensagem de sucesso', async () => {
      const result = await service.logout();
      expect(result.message).toBe('Logout realizado com sucesso');
    });
  });

  describe('forgotPassword', () => {
    it('retorna sucesso sem revelar que email não existe', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      const result = await service.forgotPassword({ email: 'nao@existe.com' });
      expect(result.success).toBe(true);
      expect(mockSmtpConfigService.sendEmail).not.toHaveBeenCalled();
    });

    it('salva token e envia email quando funcionário existe', async () => {
      const mockEmployee = {
        id: 1,
        email: 'a@a.com',
        nome: 'Test',
        reset_password_token: null,
        reset_password_expires: null,
      };
      mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockResolvedValue(mockEmployee);
      mockSmtpConfigService.sendEmail.mockResolvedValue(undefined);

      const result = await service.forgotPassword({ email: 'a@a.com' });

      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ reset_password_token: expect.any(String) }),
      );
      expect(mockSmtpConfigService.sendEmail).toHaveBeenCalledWith(
        'a@a.com',
        'Recuperação de Senha',
        expect.stringContaining('reset-password'),
      );
      expect(result.success).toBe(true);
    });

    it('usa http://localhost:5173 quando FRONTEND_URL não está configurado', async () => {
      const mockEmployee = {
        id: 1,
        email: 'a@a.com',
        nome: 'Test',
        reset_password_token: null,
        reset_password_expires: null,
      };
      mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockResolvedValue(mockEmployee);
      mockSmtpConfigService.sendEmail.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue(undefined); // FRONTEND_URL não configurado

      const result = await service.forgotPassword({ email: 'a@a.com' });
      expect(result.success).toBe(true);
      expect(mockSmtpConfigService.sendEmail).toHaveBeenCalledWith(
        'a@a.com',
        'Recuperação de Senha',
        expect.stringContaining('http://localhost:5173'),
      );
    });

    it('retorna sucesso mesmo quando sendEmail lança erro', async () => {
      const mockEmployee = {
        id: 1,
        email: 'a@a.com',
        nome: 'Test',
        reset_password_token: null,
        reset_password_expires: null,
      };
      mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockResolvedValue(mockEmployee);
      mockSmtpConfigService.sendEmail.mockRejectedValue(new Error('SMTP fail'));

      const result = await service.forgotPassword({ email: 'a@a.com' });
      expect(result.success).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('lança BadRequestException quando token é inválido', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      await expect(
        service.resetPassword({ token: 'invalid', password: 'newpass' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('atualiza senha e limpa token quando token é válido', async () => {
      const mockEmployee = {
        id: 1,
        senha: 'oldHash',
        reset_password_token: 'valid-token',
        reset_password_expires: new Date(Date.now() + 3600000),
      };
      mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockResolvedValue({
        ...mockEmployee,
        reset_password_token: null,
        reset_password_expires: null,
      });

      const result = await service.resetPassword({
        token: 'valid-token',
        password: 'newpass',
      });

      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          reset_password_token: null,
          reset_password_expires: null,
        }),
      );
      expect(result.success).toBe(true);
    });
  });
});
