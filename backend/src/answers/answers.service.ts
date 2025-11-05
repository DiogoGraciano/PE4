import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) {}

  async create(createAnswerDto: CreateAnswerDto) {
    const answer = this.answersRepository.create(createAnswerDto);
    const saved = await this.answersRepository.save(answer);

    return {
      success: true,
      message: 'Resposta criada com sucesso',
      data: saved,
    };
  }

  async findAll(filters?: any) {
    const where: any = {};

    if (filters?.pergunta_id) {
      where.pergunta_id = +filters.pergunta_id;
    }

    if (filters?.aluno_id) {
      where.aluno_id = +filters.aluno_id;
    }

    if (filters?.professor_id) {
      where.professor_id = +filters.professor_id;
    }

    const answers = await this.answersRepository.find({
      where,
      relations: ['pergunta', 'aluno', 'professor'],
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      message: 'Respostas recuperadas com sucesso',
      data: answers,
    };
  }

  async findOne(id: number) {
    const answer = await this.answersRepository.findOne({
      where: { id },
      relations: ['pergunta', 'aluno', 'professor'],
    });

    if (!answer) {
      throw new NotFoundException('Resposta não encontrada');
    }

    return {
      success: true,
      message: 'Resposta recuperada com sucesso',
      data: answer,
    };
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) {
    const answer = await this.answersRepository.findOne({
      where: { id },
    });

    if (!answer) {
      throw new NotFoundException('Resposta não encontrada');
    }

    Object.assign(answer, updateAnswerDto);
    const updated = await this.answersRepository.save(answer);

    return {
      success: true,
      message: 'Resposta atualizada com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const answer = await this.answersRepository.findOne({
      where: { id },
    });

    if (!answer) {
      throw new NotFoundException('Resposta não encontrada');
    }

    await this.answersRepository.remove(answer);

    return {
      success: true,
      message: 'Resposta removida com sucesso',
      data: null,
    };
  }
}

