import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const existingCompany = await this.companiesRepository.findOne({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    const company = this.companiesRepository.create(createCompanyDto);
    const saved = await this.companiesRepository.save(company);

    return {
      success: true,
      message: 'Empresa criada com sucesso',
      data: saved,
    };
  }

  async findAll() {
    const companies = await this.companiesRepository.find({
      order: { razao_social: 'ASC' },
    });

    return {
      success: true,
      message: 'Empresas recuperadas com sucesso',
      data: companies,
    };
  }

  async findOne(id: number) {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return {
      success: true,
      message: 'Empresa recuperada com sucesso',
      data: company,
    };
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== company.cnpj) {
      const existingCompany = await this.companiesRepository.findOne({
        where: { cnpj: updateCompanyDto.cnpj },
      });

      if (existingCompany) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    Object.assign(company, updateCompanyDto);
    const updated = await this.companiesRepository.save(company);

    return {
      success: true,
      message: 'Empresa atualizada com sucesso',
      data: updated,
    };
  }

  async remove(id: number) {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    await this.companiesRepository.remove(company);

    return {
      success: true,
      message: 'Empresa removida com sucesso',
      data: null,
    };
  }
}

