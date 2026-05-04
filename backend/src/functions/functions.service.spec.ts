import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { Function as FunctionEntity } from './entities/function.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const sampleFunction = { id: 1, codigo: 'ADM', nome_funcao: 'Administrador' };

describe('FunctionsService', () => {
  let service: FunctionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunctionsService,
        { provide: getRepositoryToken(FunctionEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<FunctionsService>(FunctionsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('retorna lista de funções', async () => {
      mockRepository.find.mockResolvedValue([sampleFunction]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('retorna função quando encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(sampleFunction);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(sampleFunction);
    });

    it('lança NotFoundException quando não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
