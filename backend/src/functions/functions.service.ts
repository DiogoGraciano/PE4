import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Function as FunctionEntity } from './entities/function.entity';
import { CreateFunctionDto } from './dto/create-function.dto';
import { UpdateFunctionDto } from './dto/update-function.dto';

@Injectable()
export class FunctionsService {
  constructor(
    @InjectRepository(FunctionEntity)
    private functionsRepository: Repository<FunctionEntity>,
  ) {}

  async create(createFunctionDto: CreateFunctionDto) {
    const existingFunction = await this.functionsRepository.findOne({
      where: { codigo: createFunctionDto.codigo },
    });

    if (existingFunction) {
      throw new ConflictException('Código de função já existe');
    }

    const functionEntity = this.functionsRepository.create(createFunctionDto);
    const saved = await this.functionsRepository.save(functionEntity);

    return {
      success: true,
      message: 'Função criada com sucesso',
      data: saved,
    };
  }

  async findAll() {
    const functions = await this.functionsRepository.find({
      order: { nome_funcao: 'ASC' },
    });

    return {
      success: true,
      message: 'Funções recuperadas com sucesso',
      data: functions,
    };
  }

  async findOne(id: number) {
    const functionEntity = await this.functionsRepository.findOne({
      where: { id },
    });

    if (!functionEntity) {
      throw new NotFoundException('Função não encontrada');
    }

    return {
      success: true,
      message: 'Função recuperada com sucesso',
      data: functionEntity,
    };
  }

  async update(id: number, updateFunctionDto: UpdateFunctionDto) {
    const functionEntity = await this.functionsRepository.findOne({
      where: { id },
    });

    if (!functionEntity) {
      throw new NotFoundException('Função não encontrada');
    }

    if (updateFunctionDto.codigo && updateFunctionDto.codigo !== functionEntity.codigo) {
      const existingFunction = await this.functionsRepository.findOne({
        where: { codigo: updateFunctionDto.codigo },
      });

      if (existingFunction) {
        throw new ConflictException('Código de função já existe');
      }
    }

    Object.assign(functionEntity, updateFunctionDto);
    const updated = await this.functionsRepository.save(functionEntity);

    return {
      success: true,
      message: 'Função atualizada com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const functionEntity = await this.functionsRepository.findOne({
      where: { id },
    });

    if (!functionEntity) {
      throw new NotFoundException('Função não encontrada');
    }

    await this.functionsRepository.remove(functionEntity);

    return {
      success: true,
      message: 'Função removida com sucesso',
      data: null,
    };
  }
}

