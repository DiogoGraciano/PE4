import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Function as FunctionEntity } from './entities/function.entity';

@Injectable()
export class FunctionsService {
  constructor(
    @InjectRepository(FunctionEntity)
    private functionsRepository: Repository<FunctionEntity>,
  ) {}

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
}
