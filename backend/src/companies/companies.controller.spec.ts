import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CompaniesController', () => {
  let controller: CompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [{ provide: CompaniesService, useValue: mockService }],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    jest.clearAllMocks();
  });

  it('create chama service.create', async () => {
    const dto = { cnpj: '12345678000100' } as any;
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
    await controller.findOne('2');
    expect(mockService.findOne).toHaveBeenCalledWith(2);
  });

  it('update chama service.update com id e DTO', async () => {
    const dto = { razao_social: 'Nova' } as any;
    mockService.update.mockResolvedValue({ success: true });
    await controller.update('2', dto);
    expect(mockService.update).toHaveBeenCalledWith(2, dto);
  });

  it('remove chama service.remove com id', async () => {
    mockService.remove.mockResolvedValue({ success: true });
    await controller.remove('2');
    expect(mockService.remove).toHaveBeenCalledWith(2);
  });
});
