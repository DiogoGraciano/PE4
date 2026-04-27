import { Injectable } from '@nestjs/common';
import PDFDocumentLib from 'pdfkit';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PDFDocument = (PDFDocumentLib as any).default ?? PDFDocumentLib;
import { CompaniesService } from '../companies/companies.service';
import { EmployeesService } from '../employees/employees.service';
import { StudentsService } from '../students/students.service';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { QuestionnaireResponsesService } from '../questionnaire-responses/questionnaire-responses.service';
import { Company } from '../companies/entities/company.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Student } from '../students/entities/student.entity';
import { Questionnaire } from '../questionnaires/entities/questionnaire.entity';
import { QuestionnaireResponse } from '../questionnaire-responses/entities/questionnaire-response.entity';

const PRIMARY_COLOR = '#1e40af';
const HEADER_BG = '#1e40af';
const ROW_ALT_BG = '#f0f4ff';
const BORDER_COLOR = '#cbd5e1';
const TEXT_DARK = '#1e293b';
const TEXT_LIGHT = '#ffffff';

@Injectable()
export class ReportsService {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly employeesService: EmployeesService,
    private readonly studentsService: StudentsService,
    private readonly questionnairesService: QuestionnairesService,
    private readonly questionnaireResponsesService: QuestionnaireResponsesService,
  ) {}

  async generateCompaniesReport(type: string): Promise<Buffer> {
    const { data: companies } = await this.companiesService.findAll();

    if (type === 'by-state') {
      const grouped = this.groupBy(companies, (c: Company) => c.estado);
      const rows: string[][] = [];
      for (const [estado, items] of Object.entries(grouped)) {
        rows.push([`Estado: ${estado}`, '', '', '']);
        for (const c of items as Company[]) {
          rows.push([c.razao_social, c.cnpj, c.cidade, c.estado]);
        }
      }
      return this.buildPdf(
        'Relatório de Empresas por Estado',
        ['Razão Social', 'CNPJ', 'Cidade', 'Estado'],
        rows,
        companies.length,
      );
    }

    const rows = (companies as Company[]).map((c) => [
      c.razao_social,
      c.cnpj,
      c.cidade,
      c.estado,
      `${c.bairro} - ${c.numero_endereco}`,
    ]);

    return this.buildPdf(
      'Relatório de Empresas',
      ['Razão Social', 'CNPJ', 'Cidade', 'Estado', 'Endereço'],
      rows,
      companies.length,
    );
  }

  async generateEmployeesReport(type: string): Promise<Buffer> {
    const { data: employees } = await this.employeesService.findAll();

    if (type === 'by-function') {
      const grouped = this.groupBy(
        employees,
        (e: Employee) => e.funcao?.nome_funcao ?? 'Sem função',
      );
      const rows: string[][] = [];
      for (const [funcao, items] of Object.entries(grouped)) {
        rows.push([`Função: ${funcao}`, '', '', '']);
        for (const e of items as Employee[]) {
          rows.push([e.nome, e.email, e.cpf, e.telefone]);
        }
      }
      return this.buildPdf(
        'Relatório de Funcionários por Função',
        ['Nome', 'Email', 'CPF', 'Telefone'],
        rows,
        employees.length,
      );
    }

    const rows = (employees as Employee[]).map((e) => [
      e.nome,
      e.email,
      e.cpf,
      e.telefone,
      e.funcao?.nome_funcao ?? '-',
    ]);

    return this.buildPdf(
      'Relatório de Funcionários',
      ['Nome', 'Email', 'CPF', 'Telefone', 'Função'],
      rows,
      employees.length,
    );
  }

  async generateStudentsReport(type: string): Promise<Buffer> {
    const { data: students } = await this.studentsService.findAll();

    if (type === 'with-notes') {
      const withNotes = (students as Student[]).filter(
        (s) => s.observacao && s.observacao.trim().length > 0,
      );
      const rows = withNotes.map((s) => [
        s.codigo,
        s.nome ?? '-',
        s.responsavel,
        s.observacao ?? '',
      ]);
      return this.buildPdf(
        'Relatório de Alunos com Observações',
        ['Código', 'Nome', 'Responsável', 'Observação'],
        rows,
        withNotes.length,
      );
    }

    const rows = (students as Student[]).map((s) => [
      s.codigo,
      s.nome ?? '-',
      s.cpf ?? '-',
      s.email ?? '-',
      s.responsavel,
    ]);

    return this.buildPdf(
      'Relatório de Alunos',
      ['Código', 'Nome', 'CPF', 'Email', 'Responsável'],
      rows,
      students.length,
    );
  }

  async generateQuestionnairesReport(type: string): Promise<Buffer> {
    if (type === 'responses') {
      const { data: responses } =
        await this.questionnaireResponsesService.findAll();

      const rows = (responses as QuestionnaireResponse[]).map((r) => [
        r.questionario?.nome ?? '-',
        r.aluno?.nome ?? '-',
        r.aluno?.email ?? '-',
        new Date(r.data_envio).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      ]);

      return this.buildPdf(
        'Relatório de Respostas de Questionários',
        ['Questionário', 'Aluno', 'Email', 'Data de Envio'],
        rows,
        responses.length,
      );
    }

    // type === 'full'
    const { data: questionnaires } = await this.questionnairesService.findAll();

    const rows = (questionnaires as Questionnaire[]).map((q) => [
      q.nome,
      new Date(q.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    ]);

    return this.buildPdf(
      'Relatório de Questionários',
      ['Nome do Questionário', 'Data de Criação'],
      rows,
      questionnaires.length,
    );
  }

  private buildPdf(
    title: string,
    headers: string[],
    rows: string[][],
    total: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 80;
      const colWidth = pageWidth / headers.length;

      // Header bar
      doc.rect(40, 40, doc.page.width - 80, 50).fill(HEADER_BG);
      doc
        .fontSize(16)
        .fillColor(TEXT_LIGHT)
        .font('Helvetica-Bold')
        .text(title, 50, 55, { width: pageWidth - 120, ellipsis: true });

      const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      doc
        .fontSize(8)
        .fillColor(TEXT_LIGHT)
        .font('Helvetica')
        .text(`Gerado em ${now}`, doc.page.width - 200, 62, { align: 'right', width: 150 });

      doc.moveDown(2.5);

      // Column headers
      const headerY = doc.y;
      doc.rect(40, headerY, pageWidth, 20).fill(PRIMARY_COLOR);
      headers.forEach((h, i) => {
        doc
          .fontSize(9)
          .fillColor(TEXT_LIGHT)
          .font('Helvetica-Bold')
          .text(h, 40 + i * colWidth + 4, headerY + 5, {
            width: colWidth - 8,
            ellipsis: true,
          });
      });

      let y = headerY + 20;
      let altRow = false;

      for (const row of rows) {
        const isGroupHeader = row.slice(1).every((v) => v === '');
        const rowHeight = isGroupHeader ? 18 : 16;

        if (y + rowHeight > doc.page.height - 60) {
          doc.addPage();
          y = 40;
        }

        if (isGroupHeader) {
          doc.rect(40, y, pageWidth, rowHeight).fill('#334155');
          doc
            .fontSize(9)
            .fillColor(TEXT_LIGHT)
            .font('Helvetica-Bold')
            .text(row[0], 44, y + 4, { width: pageWidth - 8 });
          altRow = false;
        } else {
          if (altRow) {
            doc.rect(40, y, pageWidth, rowHeight).fill(ROW_ALT_BG);
          }
          doc.rect(40, y, pageWidth, rowHeight).stroke(BORDER_COLOR);

          row.forEach((cell, i) => {
            doc
              .fontSize(8)
              .fillColor(TEXT_DARK)
              .font('Helvetica')
              .text(cell ?? '-', 40 + i * colWidth + 4, y + 4, {
                width: colWidth - 8,
                ellipsis: true,
              });
          });
          altRow = !altRow;
        }

        y += rowHeight;
      }

      // Footer — posicionado logo após a última linha da tabela
      doc
        .fontSize(8)
        .fillColor('#64748b')
        .font('Helvetica')
        .text(`Total de registros: ${total}`, 40, y + 8, { width: pageWidth });

      doc.end();
    });
  }

  private groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
    return arr.reduce(
      (acc, item) => {
        const k = key(item) ?? 'Outros';
        if (!acc[k]) acc[k] = [];
        acc[k].push(item);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  }
}
