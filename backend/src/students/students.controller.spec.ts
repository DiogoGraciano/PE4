import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('StudentsController', () => {
  let controller: StudentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: mockService }],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    jest.clearAllMocks();
  });

  it('create chama service.create', async () => {
    const dto = { codigo: 'ALU001' } as any;
    mockService.create.mockResolvedValue({ success: true });
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll chama service.findAll', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne chama service.findOne com id convertido', async () => {
    mockService.findOne.mockResolvedValue({ success: true });
    await controller.findOne('3');
    expect(mockService.findOne).toHaveBeenCalledWith(3);
  });

  it('update chama service.update com id e DTO', async () => {
    const dto = { nome: 'Novo' } as any;
    mockService.update.mockResolvedValue({ success: true });
    await controller.update('3', dto);
    expect(mockService.update).toHaveBeenCalledWith(3, dto);
  });

  it('remove chama service.remove com id', async () => {
    mockService.remove.mockResolvedValue({ success: true });
    await controller.remove('3');
    expect(mockService.remove).toHaveBeenCalledWith(3);
  });
});
