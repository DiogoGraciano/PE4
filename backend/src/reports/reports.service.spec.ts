import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { CompaniesService } from '../companies/companies.service';
import { EmployeesService } from '../employees/employees.service';
import { StudentsService } from '../students/students.service';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { QuestionnaireResponsesService } from '../questionnaire-responses/questionnaire-responses.service';

jest.mock('pdfkit', () => {
  const { EventEmitter } = require('events');
  class MockPDFDocument extends EventEmitter {
    page = { width: 841, height: 595 };
    y = 100;
    rect() { return this; }
    fill() { return this; }
    stroke() { return this; }
    fontSize() { return this; }
    fillColor() { return this; }
    font() { return this; }
    text() { return this; }
    moveDown() { return this; }
    addPage() { return this; }
    end() { this.emit('end'); return this; }
  }
  return MockPDFDocument;
});

const mockCompaniesService = { findAll: jest.fn() };
const mockEmployeesService = { findAll: jest.fn() };
const mockStudentsService = { findAll: jest.fn() };
const mockQuestionnairesService = { findAll: jest.fn() };
const mockQRService = { findAll: jest.fn() };

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: EmployeesService, useValue: mockEmployeesService },
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: QuestionnairesService, useValue: mockQuestionnairesService },
        {
          provide: QuestionnaireResponsesService,
          useValue: mockQRService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  describe('generateCompaniesReport', () => {
    const sampleCompanies = [
      { razao_social: 'Empresa A', cnpj: '11', cidade: 'SP', estado: 'SP', bairro: 'Centro', numero_endereco: '1' },
      { razao_social: 'Empresa B', cnpj: '22', cidade: 'RJ', estado: 'RJ', bairro: 'Copacabana', numero_endereco: '2' },
    ];

    // 30 companies to trigger addPage (y=120 + 16*row > 535)
    const manyCompanies = Array.from({ length: 30 }, (_, i) => ({
      razao_social: `Empresa ${i}`,
      cnpj: String(i),
      cidade: 'SP',
      estado: null,
      bairro: 'Centro',
      numero_endereco: '1',
    }));

    it('gera PDF completo (full)', async () => {
      mockCompaniesService.findAll.mockResolvedValue({ data: sampleCompanies });
      const result = await service.generateCompaniesReport('full');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('gera PDF agrupado por estado (by-state)', async () => {
      mockCompaniesService.findAll.mockResolvedValue({ data: sampleCompanies });
      const result = await service.generateCompaniesReport('by-state');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('aciona addPage quando há muitas linhas (by-state com 30 empresas)', async () => {
      mockCompaniesService.findAll.mockResolvedValue({ data: manyCompanies });
      const result = await service.generateCompaniesReport('by-state');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('aciona addPage quando há muitas linhas (full com 30 empresas)', async () => {
      mockCompaniesService.findAll.mockResolvedValue({ data: manyCompanies });
      const result = await service.generateCompaniesReport('full');
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateEmployeesReport', () => {
    const sampleEmployees = [
      { nome: 'Emp A', email: 'a@a.com', cpf: '111', telefone: '11', funcao: { nome_funcao: 'Dev' } },
      { nome: 'Emp B', email: 'b@b.com', cpf: '222', telefone: '22', funcao: null },
    ];

    it('gera PDF completo (full)', async () => {
      mockEmployeesService.findAll.mockResolvedValue({ data: sampleEmployees });
      const result = await service.generateEmployeesReport('full');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('gera PDF agrupado por função (by-function)', async () => {
      mockEmployeesService.findAll.mockResolvedValue({ data: sampleEmployees });
      const result = await service.generateEmployeesReport('by-function');
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateStudentsReport', () => {
    const sampleStudents = [
      { codigo: 'ALU001', nome: 'Aluno A', cpf: '111', email: 'a@a.com', responsavel: 'Resp A', observacao: 'Obs aqui' },
      { codigo: 'ALU002', nome: 'Aluno B', cpf: '222', email: 'b@b.com', responsavel: 'Resp B', observacao: '' },
      // nome/cpf/email null para cobrir o branch ?? '-'
      { codigo: 'ALU003', nome: null, cpf: null, email: null, responsavel: 'Resp C', observacao: 'Obs C' },
    ];

    it('gera PDF completo (full)', async () => {
      mockStudentsService.findAll.mockResolvedValue({ data: sampleStudents });
      const result = await service.generateStudentsReport('full');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('gera PDF apenas com alunos com observações (with-notes)', async () => {
      mockStudentsService.findAll.mockResolvedValue({ data: sampleStudents });
      const result = await service.generateStudentsReport('with-notes');
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateQuestionnairesReport', () => {
    const sampleQuestionnaires = [
      { nome: 'Q1', created_at: new Date('2024-01-01') },
    ];
    const sampleResponses = [
      {
        questionario: { nome: 'Q1' },
        aluno: { nome: 'Aluno A', email: 'a@a.com' },
        data_envio: new Date('2024-06-15T10:30:00Z'),
      },
      // questionario/aluno null para cobrir o branch ?? '-'
      {
        questionario: null,
        aluno: null,
        data_envio: new Date('2024-06-15T10:30:00Z'),
      },
    ];

    it('gera PDF completo de questionários (full)', async () => {
      mockQuestionnairesService.findAll.mockResolvedValue({ data: sampleQuestionnaires });
      const result = await service.generateQuestionnairesReport('full');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('gera PDF de respostas de questionários (responses)', async () => {
      mockQRService.findAll.mockResolvedValue({ data: sampleResponses });
      const result = await service.generateQuestionnairesReport('responses');
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
