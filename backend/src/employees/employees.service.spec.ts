import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const sampleEmployee = {
  id: 1,
  nome: 'Test User',
  email: 'test@test.com',
  cpf: '12345678900',
  telefone: '11999999999',
  senha: 'hashed',
  funcao_id: 1,
};

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria funcionário com sucesso sem retornar senha', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(sampleEmployee);
      mockRepository.save.mockResolvedValue(sampleEmployee);

      const result = await service.create({
        nome: 'Test User',
        email: 'test@test.com',
        cpf: '12345678900',
        senha: 'pass',
        funcao_id: 1,
      } as any);

      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('senha');
    });

    it('lança ConflictException quando email já existe', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...sampleEmployee,
        email: 'test@test.com',
      });

      await expect(
        service.create({ email: 'test@test.com', cpf: '99999999999' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('lança ConflictException quando CPF já existe', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...sampleEmployee,
        email: 'other@test.com',
        cpf: '12345678900',
      });

      await expect(
        service.create({ email: 'novo@test.com', cpf: '12345678900' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('retorna lista de funcionários', async () => {
      mockRepository.find.mockResolvedValue([sampleEmployee]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('retorna funcionário quando encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(sampleEmployee);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(sampleEmployee);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza funcionário com sucesso', async () => {
      const updatedEmployee = { ...sampleEmployee, nome: 'Updated' };
      mockRepository.findOne
        .mockResolvedValueOnce(sampleEmployee) // busca por id
        .mockResolvedValue(null); // busca por email/cpf
      mockRepository.save.mockResolvedValue({ ...updatedEmployee, senha: 'hashed' });

      const result = await service.update(1, { nome: 'Updated' } as any);
      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('senha');
    });

    it('lança NotFoundException quando funcionário não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });

    it('lança ConflictException quando novo email já está em uso', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(sampleEmployee) // busca por id
        .mockResolvedValue({ id: 2, email: 'outro@test.com' }); // email já existe

      await expect(
        service.update(1, { email: 'outro@test.com' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('lança ConflictException quando novo CPF já está em uso', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(sampleEmployee) // busca por id
        .mockResolvedValue({ id: 2, cpf: '99999999999' }); // cpf já existe (email não é verificado pois não veio no dto)

      await expect(
        service.update(1, { cpf: '99999999999' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('não verifica email quando email não mudou', async () => {
      mockRepository.findOne.mockResolvedValueOnce(sampleEmployee);
      mockRepository.save.mockResolvedValue({ ...sampleEmployee, senha: 'hashed' });

      const result = await service.update(1, {
        email: sampleEmployee.email,
      } as any);
      expect(result.success).toBe(true);
      // findOne chamado apenas uma vez (busca por id), não uma segunda vez para email
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('remove funcionário com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue(sampleEmployee);
      mockRepository.remove.mockResolvedValue(sampleEmployee);

      const result = await service.remove(1);
      expect(result.success).toBe(true);
      expect(mockRepository.remove).toHaveBeenCalledWith(sampleEmployee);
    });

    it('lança NotFoundException quando funcionário não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
