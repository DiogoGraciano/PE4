import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [{ provide: EmployeesService, useValue: mockService }],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    jest.clearAllMocks();
  });

  it('create chama service.create com o DTO', async () => {
    const dto = { nome: 'Test' } as any;
    mockService.create.mockResolvedValue({ success: true });
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll chama service.findAll', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne chama service.findOne com o id convertido', async () => {
    mockService.findOne.mockResolvedValue({ success: true });
    await controller.findOne('1');
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('update chama service.update com id e DTO', async () => {
    const dto = { nome: 'Updated' } as any;
    mockService.update.mockResolvedValue({ success: true });
    await controller.update('1', dto);
    expect(mockService.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove chama service.remove com o id', async () => {
    mockService.remove.mockResolvedValue({ success: true });
    await controller.remove('1');
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
