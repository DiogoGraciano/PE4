import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ReferralsController', () => {
  let controller: ReferralsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralsController],
      providers: [{ provide: ReferralsService, useValue: mockService }],
    }).compile();

    controller = module.get<ReferralsController>(ReferralsController);
    jest.clearAllMocks();
  });

  it('create chama service.create', async () => {
    const dto = { aluno_id: 1, empresa_id: 1 } as any;
    mockService.create.mockResolvedValue({ success: true });
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll sem query chama service.findAll sem alunoId', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll(undefined);
    expect(mockService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findAll com aluno_id chama service.findAll com id convertido', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll('7');
    expect(mockService.findAll).toHaveBeenCalledWith(7);
  });

  it('findOne chama service.findOne com id convertido', async () => {
    mockService.findOne.mockResolvedValue({ success: true });
    await controller.findOne('7');
    expect(mockService.findOne).toHaveBeenCalledWith(7);
  });

  it('update chama service.update com id e DTO', async () => {
    const dto = { funcao: 'Dev' } as any;
    mockService.update.mockResolvedValue({ success: true });
    await controller.update('7', dto);
    expect(mockService.update).toHaveBeenCalledWith(7, dto);
  });

  it('remove chama service.remove com id', async () => {
    mockService.remove.mockResolvedValue({ success: true });
    await controller.remove('7');
    expect(mockService.remove).toHaveBeenCalledWith(7);
  });
});
