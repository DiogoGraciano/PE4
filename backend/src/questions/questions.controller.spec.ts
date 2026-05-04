import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('QuestionsController', () => {
  let controller: QuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [{ provide: QuestionsService, useValue: mockService }],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
    jest.clearAllMocks();
  });

  it('create chama service.create', async () => {
    const dto = { texto_pergunta: 'Qual?' } as any;
    mockService.create.mockResolvedValue({ success: true });
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll sem query chama service.findAll sem questionnaireId', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll(undefined);
    expect(mockService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findAll com questionnaire_id chama service.findAll com id convertido', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll('1');
    expect(mockService.findAll).toHaveBeenCalledWith(1);
  });

  it('findOne chama service.findOne com id convertido', async () => {
    mockService.findOne.mockResolvedValue({ success: true });
    await controller.findOne('5');
    expect(mockService.findOne).toHaveBeenCalledWith(5);
  });

  it('update chama service.update com id e DTO', async () => {
    const dto = { texto_pergunta: 'Nova?' } as any;
    mockService.update.mockResolvedValue({ success: true });
    await controller.update('5', dto);
    expect(mockService.update).toHaveBeenCalledWith(5, dto);
  });

  it('remove chama service.remove com id', async () => {
    mockService.remove.mockResolvedValue({ success: true });
    await controller.remove('5');
    expect(mockService.remove).toHaveBeenCalledWith(5);
  });
});
