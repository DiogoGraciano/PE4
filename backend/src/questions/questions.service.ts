import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const question = this.questionsRepository.create(createQuestionDto);
    const saved = await this.questionsRepository.save(question);

    return {
      success: true,
      message: 'Pergunta criada com sucesso',
      data: saved,
    };
  }

  async findAll(questionnaireId?: number) {
    const where = questionnaireId ? { questionario_id: questionnaireId } : {};
    const questions = await this.questionsRepository.find({
      where,
      relations: ['questionario'],
      order: { id: 'ASC' },
    });

    return {
      success: true,
      message: 'Perguntas recuperadas com sucesso',
      data: questions,
    };
  }

  async findOne(id: number) {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['questionario'],
    });

    if (!question) {
      throw new NotFoundException('Pergunta não encontrada');
    }

    return {
      success: true,
      message: 'Pergunta recuperada com sucesso',
      data: question,
    };
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.questionsRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Pergunta não encontrada');
    }

    Object.assign(question, updateQuestionDto);
    const updated = await this.questionsRepository.save(question);

    return {
      success: true,
      message: 'Pergunta atualizada com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const question = await this.questionsRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Pergunta não encontrada');
    }

    await this.questionsRepository.remove(question);

    return {
      success: true,
      message: 'Pergunta removida com sucesso',
      data: null,
    };
  }
}

