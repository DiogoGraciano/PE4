import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { QuestionnaireResponsesService } from './questionnaire-responses.service';
import { QuestionnaireResponse } from './entities/questionnaire-response.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const sampleResponse = {
  id: 1,
  questionario_id: 1,
  aluno_id: 1,
  respostas_json: '{}',
  data_envio: new Date(),
};

describe('QuestionnaireResponsesService', () => {
  let service: QuestionnaireResponsesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionnaireResponsesService,
        {
          provide: getRepositoryToken(QuestionnaireResponse),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<QuestionnaireResponsesService>(QuestionnaireResponsesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria resposta com sucesso', async () => {
      mockRepository.create.mockReturnValue(sampleResponse);
      mockRepository.save.mockResolvedValue(sampleResponse);

      const result = await service.create({ questionario_id: 1, aluno_id: 1 } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('findAll', () => {
    it('retorna todas as respostas sem filtro', async () => {
      mockRepository.find.mockResolvedValue([sampleResponse]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('retorna respostas filtradas por questionário', async () => {
      mockRepository.find.mockResolvedValue([sampleResponse]);
      const result = await service.findAll(1);
      expect(result.success).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { questionario_id: 1 } }),
      );
    });
  });

  describe('findOne', () => {
    it('retorna resposta quando encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(sampleResponse);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza resposta com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleResponse);
      mockRepository.save.mockResolvedValue({ ...sampleResponse, respostas_json: '{a:1}' });

      const result = await service.update(1, { respostas_json: '{a:1}' } as any);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('remove resposta com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleResponse);
      mockRepository.remove.mockResolvedValue(sampleResponse);

      const result = await service.remove(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
