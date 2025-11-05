import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionnaireResponse } from './entities/questionnaire-response.entity';
import { CreateQuestionnaireResponseDto } from './dto/create-questionnaire-response.dto';
import { UpdateQuestionnaireResponseDto } from './dto/update-questionnaire-response.dto';

@Injectable()
export class QuestionnaireResponsesService {
  constructor(
    @InjectRepository(QuestionnaireResponse)
    private questionnaireResponsesRepository: Repository<QuestionnaireResponse>,
  ) {}

  async create(createQuestionnaireResponseDto: CreateQuestionnaireResponseDto) {
    const questionnaireResponse = this.questionnaireResponsesRepository.create(
      createQuestionnaireResponseDto,
    );
    const saved =
      await this.questionnaireResponsesRepository.save(questionnaireResponse);

    return {
      success: true,
      message: 'Resposta de questionário criada com sucesso',
      data: saved,
    };
  }

  async findAll(questionnaireId?: number) {
    const where = questionnaireId
      ? { questionario_id: questionnaireId }
      : {};
    const questionnaireResponses =
      await this.questionnaireResponsesRepository.find({
        where,
        relations: ['questionario', 'aluno'],
        order: { data_envio: 'DESC' },
      });

    return {
      success: true,
      message: 'Respostas de questionários recuperadas com sucesso',
      data: questionnaireResponses,
    };
  }

  async findOne(id: number) {
    const questionnaireResponse =
      await this.questionnaireResponsesRepository.findOne({
        where: { id },
        relations: ['questionario', 'aluno'],
      });

    if (!questionnaireResponse) {
      throw new NotFoundException('Resposta de questionário não encontrada');
    }

    return {
      success: true,
      message: 'Resposta de questionário recuperada com sucesso',
      data: questionnaireResponse,
    };
  }

  async update(
    id: number,
    updateQuestionnaireResponseDto: UpdateQuestionnaireResponseDto,
  ) {
    const questionnaireResponse =
      await this.questionnaireResponsesRepository.findOne({
        where: { id },
      });

    if (!questionnaireResponse) {
      throw new NotFoundException('Resposta de questionário não encontrada');
    }

    Object.assign(questionnaireResponse, updateQuestionnaireResponseDto);
    const updated =
      await this.questionnaireResponsesRepository.save(questionnaireResponse);

    return {
      success: true,
      message: 'Resposta de questionário atualizada com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const questionnaireResponse =
      await this.questionnaireResponsesRepository.findOne({
        where: { id },
      });

    if (!questionnaireResponse) {
      throw new NotFoundException('Resposta de questionário não encontrada');
    }

    await this.questionnaireResponsesRepository.remove(questionnaireResponse);

    return {
      success: true,
      message: 'Resposta de questionário removida com sucesso',
      data: null,
    };
  }
}

