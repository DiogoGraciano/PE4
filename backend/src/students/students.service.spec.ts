import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const sampleStudent = {
  id: 1,
  nome: 'Aluno Teste',
  email: 'aluno@test.com',
  cpf: '12345678900',
  codigo: 'ALU001',
};

describe('StudentsService', () => {
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria aluno com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(sampleStudent);
      mockRepository.save.mockResolvedValue(sampleStudent);

      const result = await service.create({ codigo: 'ALU001' } as any);
      expect(result.success).toBe(true);
    });

    it('lança ConflictException quando código já existe', async () => {
      mockRepository.findOne.mockResolvedValue(sampleStudent);
      await expect(service.create({ codigo: 'ALU001' } as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('retorna lista de alunos', async () => {
      mockRepository.find.mockResolvedValue([sampleStudent]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('retorna aluno quando encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(sampleStudent);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza aluno com sucesso', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(sampleStudent)
        .mockResolvedValue(null);
      mockRepository.save.mockResolvedValue({ ...sampleStudent, nome: 'Novo Nome' });

      const result = await service.update(1, { nome: 'Novo Nome' } as any);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando aluno não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });

    it('lança ConflictException quando novo código já está em uso', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(sampleStudent)
        .mockResolvedValue({ id: 2, codigo: 'ALU002' });

      await expect(
        service.update(1, { codigo: 'ALU002' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('não verifica código quando ele não mudou', async () => {
      mockRepository.findOne.mockResolvedValueOnce(sampleStudent);
      mockRepository.save.mockResolvedValue(sampleStudent);

      const result = await service.update(1, { codigo: sampleStudent.codigo } as any);
      expect(result.success).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('remove aluno com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleStudent);
      mockRepository.remove.mockResolvedValue(sampleStudent);

      const result = await service.remove(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando aluno não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
