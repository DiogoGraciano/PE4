import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { Referral } from './entities/referral.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const sampleReferral = {
  id: 1,
  aluno_id: 1,
  empresa_id: 1,
  funcao: 'Desenvolvedor',
  data_admissao: '2024-01-01',
};

describe('ReferralsService', () => {
  let service: ReferralsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        { provide: getRepositoryToken(Referral), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria encaminhamento com sucesso', async () => {
      mockRepository.create.mockReturnValue(sampleReferral);
      mockRepository.save.mockResolvedValue(sampleReferral);

      const result = await service.create({ aluno_id: 1, empresa_id: 1 } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('findAll', () => {
    it('retorna todos os encaminhamentos sem filtro', async () => {
      mockRepository.find.mockResolvedValue([sampleReferral]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('retorna encaminhamentos filtrados por aluno', async () => {
      mockRepository.find.mockResolvedValue([sampleReferral]);
      const result = await service.findAll(1);
      expect(result.success).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { aluno_id: 1 } }),
      );
    });
  });

  describe('findOne', () => {
    it('retorna encaminhamento quando encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(sampleReferral);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza encaminhamento com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleReferral);
      mockRepository.save.mockResolvedValue({ ...sampleReferral, funcao: 'Analista' });

      const result = await service.update(1, { funcao: 'Analista' } as any);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('remove encaminhamento com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleReferral);
      mockRepository.remove.mockResolvedValue(sampleReferral);

      const result = await service.remove(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
