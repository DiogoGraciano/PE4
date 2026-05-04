import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { SmtpConfigService } from './smtp-config.service';
import { SmtpConfig } from './entities/smtp-config.entity';

const mockVerify = jest.fn();
const mockSendMail = jest.fn();
const mockTransporter = { verify: mockVerify, sendMail: mockSendMail };

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter),
}));

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const vars: Record<string, string> = {
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USER: 'user@test.com',
      SMTP_PASSWORD: 'secret',
      SMTP_FROM: 'noreply@test.com',
    };
    return vars[key];
  }),
};

const smtpDto = {
  host: 'smtp.test.com',
  port: 587,
  secure: false,
  user: 'user@test.com',
  password: 'secret',
  from: 'noreply@test.com',
};

describe('SmtpConfigService', () => {
  let service: SmtpConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmtpConfigService,
        { provide: getRepositoryToken(SmtpConfig), useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<SmtpConfigService>(SmtpConfigService);
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('retorna null quando não há configuração', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.getConfig();
      expect(result.data).toBeNull();
    });

    it('retorna primeiro registro quando existe', async () => {
      const config = { id: 1, ...smtpDto };
      mockRepository.find.mockResolvedValue([config]);
      const result = await service.getConfig();
      expect(result.data).toEqual(config);
    });
  });

  describe('saveConfig', () => {
    it('cria nova configuração quando não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const newConfig = { id: 1, ...smtpDto };
      mockRepository.create.mockReturnValue(newConfig);
      mockRepository.save.mockResolvedValue(newConfig);

      const result = await service.saveConfig(smtpDto as any);
      expect(result.success).toBe(true);
      expect(mockRepository.create).toHaveBeenCalledWith(smtpDto);
    });

    it('atualiza configuração existente via Object.assign', async () => {
      const existingConfig = { id: 1, host: 'old.host', ...smtpDto };
      mockRepository.findOne.mockResolvedValue(existingConfig);
      mockRepository.save.mockResolvedValue({ ...existingConfig, ...smtpDto });

      const result = await service.saveConfig(smtpDto as any);
      expect(result.success).toBe(true);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('testConnection', () => {
    it('retorna sucesso quando conexão é válida', async () => {
      mockVerify.mockResolvedValue(undefined);
      const result = await service.testConnection(smtpDto as any);
      expect(result.success).toBe(true);
      expect(mockVerify).toHaveBeenCalled();
    });

    it('usa secure=true como padrão quando não fornecido', async () => {
      mockVerify.mockResolvedValue(undefined);
      const dtoSemSecure = { ...smtpDto, secure: undefined };
      await service.testConnection(dtoSemSecure as any);
      const nodemailer = require('nodemailer');
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ secure: true }),
      );
    });

    it('lança InternalServerErrorException quando conexão falha', async () => {
      mockVerify.mockRejectedValue(new Error('auth failed'));
      await expect(service.testConnection(smtpDto as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('sendEmail', () => {
    it('envia email usando configuração do banco', async () => {
      const dbConfig = { id: 1, ...smtpDto };
      mockRepository.find.mockResolvedValue([dbConfig]);
      mockSendMail.mockResolvedValue({ accepted: ['to@test.com'] });

      const result = await service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>');
      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'to@test.com', subject: 'Subject' }),
      );
    });

    it('usa secure=false como padrão quando config do banco não tem secure', async () => {
      const dbConfig = { id: 1, ...smtpDto, secure: undefined };
      mockRepository.find.mockResolvedValue([dbConfig]);
      mockSendMail.mockResolvedValue({ accepted: ['to@test.com'] });

      const result = await service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>');
      expect(result.success).toBe(true);
    });

    it('não inclui auth quando user está vazio no envio de email', async () => {
      const dbConfig = { id: 1, ...smtpDto, user: '' };
      mockRepository.find.mockResolvedValue([dbConfig]);
      mockSendMail.mockResolvedValue({ accepted: ['to@test.com'] });

      const nodemailer = require('nodemailer');
      jest.clearAllMocks();
      mockRepository.find.mockResolvedValue([dbConfig]);
      mockSendMail.mockResolvedValue({ accepted: ['to@test.com'] });

      await service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>');
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ auth: undefined }),
      );
    });

    it('envia email usando variáveis de ambiente quando não há config no banco', async () => {
      mockRepository.find.mockResolvedValue([]);
      mockSendMail.mockResolvedValue({ accepted: ['to@test.com'] });

      const result = await service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>');
      expect(result.success).toBe(true);
    });

    it('lança InternalServerErrorException quando host existe mas port não', async () => {
      mockRepository.find.mockResolvedValue([]);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SMTP_HOST') return 'smtp.test.com';
        return undefined;
      });

      await expect(
        service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('lança InternalServerErrorException quando não há nenhuma config SMTP', async () => {
      mockRepository.find.mockResolvedValue([]);
      mockConfigService.get.mockReturnValue(undefined);

      await expect(
        service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('lança InternalServerErrorException quando sendMail falha', async () => {
      const dbConfig = { id: 1, ...smtpDto };
      mockRepository.find.mockResolvedValue([dbConfig]);
      mockSendMail.mockRejectedValue(new Error('send failed'));

      await expect(
        service.sendEmail('to@test.com', 'Subject', '<p>HTML</p>'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
