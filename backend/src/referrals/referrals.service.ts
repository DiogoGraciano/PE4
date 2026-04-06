import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral)
    private referralsRepository: Repository<Referral>,
  ) {}

  async create(createReferralDto: CreateReferralDto) {
    const referral = this.referralsRepository.create(createReferralDto);
    const saved = await this.referralsRepository.save(referral);

    return {
      success: true,
      message: 'Encaminhamento criado com sucesso',
      data: saved,
    };
  }

  async findAll(alunoId?: number) {
    const where = alunoId ? { aluno_id: alunoId } : {};
    const referrals = await this.referralsRepository.find({
      where,
      relations: ['aluno', 'empresa'],
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      message: 'Encaminhamentos recuperados com sucesso',
      data: referrals,
    };
  }

  async findOne(id: number) {
    const referral = await this.referralsRepository.findOne({
      where: { id },
      relations: ['aluno', 'empresa'],
    });

    if (!referral) {
      throw new NotFoundException('Encaminhamento não encontrado');
    }

    return {
      success: true,
      message: 'Encaminhamento recuperado com sucesso',
      data: referral,
    };
  }

  async update(id: number, updateReferralDto: UpdateReferralDto) {
    const referral = await this.referralsRepository.findOne({
      where: { id },
    });

    if (!referral) {
      throw new NotFoundException('Encaminhamento não encontrado');
    }

    Object.assign(referral, updateReferralDto);
    const updated = await this.referralsRepository.save(referral);

    return {
      success: true,
      message: 'Encaminhamento atualizado com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const referral = await this.referralsRepository.findOne({
      where: { id },
    });

    if (!referral) {
      throw new NotFoundException('Encaminhamento não encontrado');
    }

    await this.referralsRepository.remove(referral);

    return {
      success: true,
      message: 'Encaminhamento removido com sucesso',
      data: null,
    };
  }
}
