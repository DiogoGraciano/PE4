import { Test, TestingModule } from '@nestjs/testing';
import { FunctionsController } from './functions.controller';
import { FunctionsService } from './functions.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('FunctionsController', () => {
  let controller: FunctionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FunctionsController],
      providers: [{ provide: FunctionsService, useValue: mockService }],
    }).compile();

    controller = module.get<FunctionsController>(FunctionsController);
    jest.clearAllMocks();
  });

  it('findAll chama service.findAll', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne chama service.findOne com id convertido', async () => {
    mockService.findOne.mockResolvedValue({ success: true });
    await controller.findOne('1');
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });
});
