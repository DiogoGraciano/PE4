import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnairesController } from './questionnaires.controller';
import { QuestionnairesService } from './questionnaires.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('QuestionnairesController', () => {
  let controller: QuestionnairesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnairesController],
      providers: [{ provide: QuestionnairesService, useValue: mockService }],
    }).compile();

    controller = module.get<QuestionnairesController>(QuestionnairesController);
    jest.clearAllMocks();
  });

  it('create chama service.create', async () => {
    const dto = { nome: 'Q1' } as any;
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
    await controller.findOne('4');
    expect(mockService.findOne).toHaveBeenCalledWith(4);
  });

  it('update chama service.update com id e DTO', async () => {
    const dto = { nome: 'Q Atualizado' } as any;
    mockService.update.mockResolvedValue({ success: true });
    await controller.update('4', dto);
    expect(mockService.update).toHaveBeenCalledWith(4, dto);
  });

  it('remove chama service.remove com id', async () => {
    mockService.remove.mockResolvedValue({ success: true });
    await controller.remove('4');
    expect(mockService.remove).toHaveBeenCalledWith(4);
  });
});
