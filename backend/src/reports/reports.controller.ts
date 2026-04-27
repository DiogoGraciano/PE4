import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { ReportsService } from './reports.service';

const COMPANY_TYPES = ['full', 'by-state'] as const;
const EMPLOYEE_TYPES = ['full', 'by-function'] as const;
const STUDENT_TYPES = ['full', 'with-notes'] as const;
const QUESTIONNAIRE_TYPES = ['full', 'responses'] as const;

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@Roles(Role.ADM, Role.RH)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('companies')
  @ApiQuery({ name: 'type', enum: COMPANY_TYPES })
  async companiesReport(
    @Query('type') type = 'full',
    @Res() res: Response,
  ) {
    if (!COMPANY_TYPES.includes(type as (typeof COMPANY_TYPES)[number])) {
      throw new BadRequestException(`Tipo inválido. Use: ${COMPANY_TYPES.join(', ')}`);
    }

    const filename = type === 'by-state' ? 'empresas_por_estado.pdf' : 'empresas_lista.pdf';
    const buffer = await this.reportsService.generateCompaniesReport(type);
    this.sendPdf(res, buffer, filename);
  }

  @Get('employees')
  @ApiQuery({ name: 'type', enum: EMPLOYEE_TYPES })
  async employeesReport(
    @Query('type') type = 'full',
    @Res() res: Response,
  ) {
    if (!EMPLOYEE_TYPES.includes(type as (typeof EMPLOYEE_TYPES)[number])) {
      throw new BadRequestException(`Tipo inválido. Use: ${EMPLOYEE_TYPES.join(', ')}`);
    }

    const filename =
      type === 'by-function' ? 'funcionarios_por_funcao.pdf' : 'funcionarios_lista.pdf';
    const buffer = await this.reportsService.generateEmployeesReport(type);
    this.sendPdf(res, buffer, filename);
  }

  @Get('students')
  @ApiQuery({ name: 'type', enum: STUDENT_TYPES })
  async studentsReport(
    @Query('type') type = 'full',
    @Res() res: Response,
  ) {
    if (!STUDENT_TYPES.includes(type as (typeof STUDENT_TYPES)[number])) {
      throw new BadRequestException(`Tipo inválido. Use: ${STUDENT_TYPES.join(', ')}`);
    }

    const filename =
      type === 'with-notes' ? 'alunos_observacoes.pdf' : 'alunos_lista.pdf';
    const buffer = await this.reportsService.generateStudentsReport(type);
    this.sendPdf(res, buffer, filename);
  }

  @Get('questionnaires')
  @ApiQuery({ name: 'type', enum: QUESTIONNAIRE_TYPES })
  async questionnairesReport(
    @Query('type') type = 'full',
    @Res() res: Response,
  ) {
    if (!QUESTIONNAIRE_TYPES.includes(type as (typeof QUESTIONNAIRE_TYPES)[number])) {
      throw new BadRequestException(`Tipo inválido. Use: ${QUESTIONNAIRE_TYPES.join(', ')}`);
    }

    const filename =
      type === 'responses' ? 'respostas_questionarios.pdf' : 'questionarios_lista.pdf';
    const buffer = await this.reportsService.generateQuestionnairesReport(type);
    this.sendPdf(res, buffer, filename);
  }

  private sendPdf(res: Response, buffer: Buffer, filename: string) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
