import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireResponsesController } from './questionnaire-responses.controller';
import { QuestionnaireResponsesService } from './questionnaire-responses.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('QuestionnaireResponsesController', () => {
  let controller: QuestionnaireResponsesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnaireResponsesController],
      providers: [{ provide: QuestionnaireResponsesService, useValue: mockService }],
    }).compile();

    controller = module.get<QuestionnaireResponsesController>(QuestionnaireResponsesController);
    jest.clearAllMocks();
  });

  it('create chama service.create', async () => {
    const dto = { questionario_id: 1 } as any;
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
    await controller.findAll('2');
    expect(mockService.findAll).toHaveBeenCalledWith(2);
  });

  it('findOne chama service.findOne com id convertido', async () => {
    mockService.findOne.mockResolvedValue({ success: true });
    await controller.findOne('6');
    expect(mockService.findOne).toHaveBeenCalledWith(6);
  });

  it('update chama service.update com id e DTO', async () => {
    const dto = { respostas_json: '{}' } as any;
    mockService.update.mockResolvedValue({ success: true });
    await controller.update('6', dto);
    expect(mockService.update).toHaveBeenCalledWith(6, dto);
  });

  it('remove chama service.remove com id', async () => {
    mockService.remove.mockResolvedValue({ success: true });
    await controller.remove('6');
    expect(mockService.remove).toHaveBeenCalledWith(6);
  });
});
