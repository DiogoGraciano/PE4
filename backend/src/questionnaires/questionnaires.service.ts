import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnairesRepository: Repository<Questionnaire>,
  ) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto) {
    const questionnaire = this.questionnairesRepository.create(
      createQuestionnaireDto,
    );
    const saved = await this.questionnairesRepository.save(questionnaire);

    return {
      success: true,
      message: 'Questionário criado com sucesso',
      data: saved,
    };
  }

  async findAll() {
    const questionnaires = await this.questionnairesRepository.find({
      order: { nome: 'ASC' },
    });

    return {
      success: true,
      message: 'Questionários recuperados com sucesso',
      data: questionnaires,
    };
  }

  async findOne(id: number) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionário não encontrado');
    }

    return {
      success: true,
      message: 'Questionário recuperado com sucesso',
      data: questionnaire,
    };
  }

  async update(id: number, updateQuestionnaireDto: UpdateQuestionnaireDto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionário não encontrado');
    }

    Object.assign(questionnaire, updateQuestionnaireDto);
    const updated = await this.questionnairesRepository.save(questionnaire);

    return {
      success: true,
      message: 'Questionário atualizado com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionário não encontrado');
    }

    await this.questionnairesRepository.remove(questionnaire);

    return {
      success: true,
      message: 'Questionário removido com sucesso',
      data: null,
    };
  }
}

