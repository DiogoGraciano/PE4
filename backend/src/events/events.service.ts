import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto, EventTypeEnum } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  private validateCoherence(
    tipo: EventTypeEnum | undefined,
    aluno_id: number | null | undefined,
    empresa_id: number | null | undefined,
  ) {
    if (!tipo) return;

    if (tipo === EventTypeEnum.VISITA_ALUNO && !aluno_id) {
      throw new BadRequestException(
        'Eventos do tipo "visita_aluno" exigem um aluno selecionado',
      );
    }
    if (tipo === EventTypeEnum.VISITA_EMPRESA && !empresa_id) {
      throw new BadRequestException(
        'Eventos do tipo "visita_empresa" exigem uma empresa selecionada',
      );
    }
    if (
      tipo === EventTypeEnum.VISITA_AMBOS &&
      (!aluno_id || !empresa_id)
    ) {
      throw new BadRequestException(
        'Eventos do tipo "visita_ambos" exigem aluno e empresa selecionados',
      );
    }
  }

  async create(createEventDto: CreateEventDto) {
    this.validateCoherence(
      createEventDto.tipo,
      createEventDto.aluno_id,
      createEventDto.empresa_id,
    );

    if (
      new Date(createEventDto.data_fim) <= new Date(createEventDto.data_inicio)
    ) {
      throw new BadRequestException(
        'A data de fim deve ser maior que a data de início',
      );
    }

    // Para eventos genéricos, ignora aluno/empresa
    if (createEventDto.tipo === EventTypeEnum.GENERICO) {
      createEventDto.aluno_id = undefined;
      createEventDto.empresa_id = undefined;
    }

    const event = this.eventsRepository.create(createEventDto);
    const saved = await this.eventsRepository.save(event);

    return {
      success: true,
      message: 'Evento criado com sucesso',
      data: saved,
    };
  }

  async findAll(start?: string, end?: string) {
    const where =
      start && end
        ? { data_inicio: Between(new Date(start), new Date(end)) }
        : {};

    const events = await this.eventsRepository.find({
      where,
      relations: ['aluno', 'empresa'],
      order: { data_inicio: 'ASC' },
    });

    return {
      success: true,
      message: 'Eventos recuperados com sucesso',
      data: events,
    };
  }

  async findOne(id: number) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['aluno', 'empresa'],
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    return {
      success: true,
      message: 'Evento recuperado com sucesso',
      data: event,
    };
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const event = await this.eventsRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    const tipo = updateEventDto.tipo ?? (event.tipo as EventTypeEnum);
    const aluno_id =
      updateEventDto.aluno_id !== undefined
        ? updateEventDto.aluno_id
        : event.aluno_id;
    const empresa_id =
      updateEventDto.empresa_id !== undefined
        ? updateEventDto.empresa_id
        : event.empresa_id;

    this.validateCoherence(tipo, aluno_id, empresa_id);

    const data_inicio = updateEventDto.data_inicio
      ? new Date(updateEventDto.data_inicio)
      : event.data_inicio;
    const data_fim = updateEventDto.data_fim
      ? new Date(updateEventDto.data_fim)
      : event.data_fim;

    if (data_fim <= data_inicio) {
      throw new BadRequestException(
        'A data de fim deve ser maior que a data de início',
      );
    }

    if (tipo === EventTypeEnum.GENERICO) {
      updateEventDto.aluno_id = undefined;
      updateEventDto.empresa_id = undefined;
      event.aluno_id = null;
      event.empresa_id = null;
    }

    Object.assign(event, updateEventDto);
    const updated = await this.eventsRepository.save(event);

    return {
      success: true,
      message: 'Evento atualizado com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const event = await this.eventsRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    await this.eventsRepository.remove(event);

    return {
      success: true,
      message: 'Evento removido com sucesso',
      data: null,
    };
  }
}
