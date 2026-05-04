import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    jest.clearAllMocks();
  });

  it('create chama service.create', async () => {
    const dto = { titulo: 'Evento' } as any;
    mockService.create.mockResolvedValue({ success: true });
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll sem datas chama service.findAll sem parâmetros', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll(undefined, undefined);
    expect(mockService.findAll).toHaveBeenCalledWith(undefined, undefined);
  });

  it('findAll com datas chama service.findAll com start e end', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [] });
    await controller.findAll('2024-01-01', '2024-12-31');
    expect(mockService.findAll).toHaveBeenCalledWith('2024-01-01', '2024-12-31');
  });

  it('findOne chama service.findOne com id convertido', async () => {
    mockService.findOne.mockResolvedValue({ success: true });
    await controller.findOne('8');
    expect(mockService.findOne).toHaveBeenCalledWith(8);
  });

  it('update chama service.update com id e DTO', async () => {
    const dto = { titulo: 'Atualizado' } as any;
    mockService.update.mockResolvedValue({ success: true });
    await controller.update('8', dto);
    expect(mockService.update).toHaveBeenCalledWith(8, dto);
  });

  it('remove chama service.remove com id', async () => {
    mockService.remove.mockResolvedValue({ success: true });
    await controller.remove('8');
    expect(mockService.remove).toHaveBeenCalledWith(8);
  });
});
