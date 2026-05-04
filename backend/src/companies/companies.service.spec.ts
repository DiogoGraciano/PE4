import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const sampleCompany = {
  id: 1,
  razao_social: 'Empresa Teste LTDA',
  cnpj: '12345678000100',
};

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: getRepositoryToken(Company), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria empresa com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(sampleCompany);
      mockRepository.save.mockResolvedValue(sampleCompany);

      const result = await service.create({ cnpj: '12345678000100' } as any);
      expect(result.success).toBe(true);
    });

    it('lança ConflictException quando CNPJ já existe', async () => {
      mockRepository.findOne.mockResolvedValue(sampleCompany);
      await expect(service.create({ cnpj: '12345678000100' } as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('retorna lista de empresas', async () => {
      mockRepository.find.mockResolvedValue([sampleCompany]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('retorna empresa quando encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(sampleCompany);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza empresa com sucesso', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(sampleCompany)
        .mockResolvedValue(null);
      mockRepository.save.mockResolvedValue({ ...sampleCompany, razao_social: 'Nova Razão' });

      const result = await service.update(1, { razao_social: 'Nova Razão' } as any);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando empresa não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });

    it('lança ConflictException quando novo CNPJ já está em uso', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(sampleCompany)
        .mockResolvedValue({ id: 2, cnpj: '99999999000100' });

      await expect(
        service.update(1, { cnpj: '99999999000100' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('não verifica CNPJ quando ele não mudou', async () => {
      mockRepository.findOne.mockResolvedValueOnce(sampleCompany);
      mockRepository.save.mockResolvedValue(sampleCompany);

      const result = await service.update(1, { cnpj: sampleCompany.cnpj } as any);
      expect(result.success).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('remove empresa com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleCompany);
      mockRepository.remove.mockResolvedValue(sampleCompany);

      const result = await service.remove(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando empresa não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
