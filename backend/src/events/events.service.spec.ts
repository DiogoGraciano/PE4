import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventTypeEnum } from './dto/create-event.dto';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const futureStart = '2099-01-01T10:00:00.000Z';
const futureEnd = '2099-01-01T12:00:00.000Z';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    jest.clearAllMocks();
  });

  describe('create — validateCoherence', () => {
    it('lança BadRequestException quando VISITA_ALUNO sem aluno_id', async () => {
      await expect(
        service.create({
          titulo: 'T',
          tipo: EventTypeEnum.VISITA_ALUNO,
          data_inicio: futureStart,
          data_fim: futureEnd,
          aluno_id: null,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança BadRequestException quando VISITA_EMPRESA sem empresa_id', async () => {
      await expect(
        service.create({
          titulo: 'T',
          tipo: EventTypeEnum.VISITA_EMPRESA,
          data_inicio: futureStart,
          data_fim: futureEnd,
          empresa_id: null,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança BadRequestException quando VISITA_AMBOS sem aluno_id', async () => {
      await expect(
        service.create({
          titulo: 'T',
          tipo: EventTypeEnum.VISITA_AMBOS,
          data_inicio: futureStart,
          data_fim: futureEnd,
          aluno_id: null,
          empresa_id: 1,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança BadRequestException quando VISITA_AMBOS sem empresa_id', async () => {
      await expect(
        service.create({
          titulo: 'T',
          tipo: EventTypeEnum.VISITA_AMBOS,
          data_inicio: futureStart,
          data_fim: futureEnd,
          aluno_id: 1,
          empresa_id: null,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança BadRequestException quando data_fim <= data_inicio', async () => {
      await expect(
        service.create({
          titulo: 'T',
          tipo: EventTypeEnum.GENERICO,
          data_inicio: futureEnd,
          data_fim: futureStart,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('cria evento GENERICO limpando aluno_id e empresa_id', async () => {
      const dto: any = {
        titulo: 'T',
        tipo: EventTypeEnum.GENERICO,
        data_inicio: futureStart,
        data_fim: futureEnd,
        aluno_id: 1,
        empresa_id: 2,
      };
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue(dto);

      await service.create(dto);

      expect(dto.aluno_id).toBeUndefined();
      expect(dto.empresa_id).toBeUndefined();
    });

    it('cria evento VISITA_ALUNO com sucesso', async () => {
      const dto: any = {
        titulo: 'T',
        tipo: EventTypeEnum.VISITA_ALUNO,
        data_inicio: futureStart,
        data_fim: futureEnd,
        aluno_id: 1,
      };
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ ...dto, id: 1 });

      const result = await service.create(dto);
      expect(result.success).toBe(true);
    });
  });

  describe('findAll', () => {
    it('retorna todos os eventos sem filtro de datas', async () => {
      mockRepository.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('retorna eventos filtrados por intervalo de datas', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.findAll(futureStart, futureEnd);
      expect(result.success).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ data_inicio: expect.anything() }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('retorna evento quando encontrado', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existingEvent = {
      id: 1,
      titulo: 'Old',
      tipo: EventTypeEnum.VISITA_ALUNO,
      aluno_id: 1,
      empresa_id: null,
      data_inicio: new Date(futureStart),
      data_fim: new Date(futureEnd),
    };

    it('lança NotFoundException quando evento não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });

    it('lança BadRequestException quando tipo/ids são incoerentes no update', async () => {
      mockRepository.findOne.mockResolvedValue(existingEvent);
      await expect(
        service.update(1, {
          tipo: EventTypeEnum.VISITA_EMPRESA,
          empresa_id: null,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança BadRequestException quando datas são inválidas no update', async () => {
      mockRepository.findOne.mockResolvedValue(existingEvent);
      await expect(
        service.update(1, {
          data_inicio: futureEnd,
          data_fim: futureStart,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('atualiza evento GENERICO limpando ids', async () => {
      const event = { ...existingEvent, aluno_id: 1, empresa_id: 2 };
      mockRepository.findOne.mockResolvedValue(event);
      mockRepository.save.mockResolvedValue({ ...event, aluno_id: null, empresa_id: null });

      const result = await service.update(1, { tipo: EventTypeEnum.GENERICO } as any);

      expect(result.success).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
      // Object.assign após o bloco GENERICO resulta em undefined (undefined de updateEventDto sobrescreve null)
      expect(event.aluno_id).toBeUndefined();
    });

    it('atualiza evento com sucesso herdando tipo existente', async () => {
      mockRepository.findOne.mockResolvedValue(existingEvent);
      mockRepository.save.mockResolvedValue({ ...existingEvent, titulo: 'New' });

      const result = await service.update(1, { titulo: 'New' } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('remove evento com sucesso', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1 });
      mockRepository.remove.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);
      expect(result.success).toBe(true);
    });

    it('lança NotFoundException quando evento não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
