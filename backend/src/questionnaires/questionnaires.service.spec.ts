import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { Questionnaire } from './entities/questionnaire.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const sampleQuestionnaire = { id: 1, nome: 'Questionário Teste', questionario_json: '{}' };

describe('QuestionnairesService', () => {
  let service: QuestionnairesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionnairesService,
        { provide: getRepositoryToken(Questionnaire), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<QuestionnairesService>(QuestionnairesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria questionário com sucesso', async () => {
      mockRepository.create.mockReturnValue(sampleQuestionnaire);
      mockRepository.save.mockResolvedValue(sampleQuestionnaire);

      const result = await service.create({ nome: 'Questionário Teste' } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('findAll', () => {
    it('retorna lista de questionários', async () => {
      mockRepository.find.mockResolvedValue([sampleQuestionnaire]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('retorna questionário quando encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(sampleQuestionnaire);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza questionário com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleQuestionnaire);
      mockRepository.save.mockResolvedValue({ ...sampleQuestionnaire, nome: 'Novo Nome' });

      const result = await service.update(1, { nome: 'Novo Nome' } as any);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('remove questionário com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleQuestionnaire);
      mockRepository.remove.mockResolvedValue(sampleQuestionnaire);

      const result = await service.remove(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
