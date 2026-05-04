import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './entities/question.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const sampleQuestion = {
  id: 1,
  questionario_id: 1,
  tipo_pergunta: 'resposta_curta',
  texto_pergunta: 'Qual seu nome?',
};

describe('QuestionsService', () => {
  let service: QuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: getRepositoryToken(Question), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria pergunta com sucesso', async () => {
      mockRepository.create.mockReturnValue(sampleQuestion);
      mockRepository.save.mockResolvedValue(sampleQuestion);

      const result = await service.create({ texto_pergunta: 'Qual seu nome?' } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('findAll', () => {
    it('retorna todas as perguntas sem filtro', async () => {
      mockRepository.find.mockResolvedValue([sampleQuestion]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('retorna perguntas filtradas por questionário', async () => {
      mockRepository.find.mockResolvedValue([sampleQuestion]);
      const result = await service.findAll(1);
      expect(result.success).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { questionario_id: 1 } }),
      );
    });
  });

  describe('findOne', () => {
    it('retorna pergunta quando encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(sampleQuestion);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza pergunta com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleQuestion);
      mockRepository.save.mockResolvedValue({ ...sampleQuestion, texto_pergunta: 'Nova?' });

      const result = await service.update(1, { texto_pergunta: 'Nova?' } as any);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('remove pergunta com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleQuestion);
      mockRepository.remove.mockResolvedValue(sampleQuestion);

      const result = await service.remove(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
