import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

const mockReportsService = {
  generateCompaniesReport: jest.fn(),
  generateEmployeesReport: jest.fn(),
  generateStudentsReport: jest.fn(),
  generateQuestionnairesReport: jest.fn(),
};

const mockRes = () => ({
  set: jest.fn(),
  end: jest.fn(),
});

describe('ReportsController', () => {
  let controller: ReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockReportsService }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    jest.clearAllMocks();
  });

  describe('companiesReport', () => {
    it('envia PDF com type=full', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockReportsService.generateCompaniesReport.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.companiesReport('full', res as any);

      expect(mockReportsService.generateCompaniesReport).toHaveBeenCalledWith('full');
      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({ 'Content-Type': 'application/pdf' }),
      );
      expect(res.end).toHaveBeenCalledWith(pdfBuffer);
    });

    it('envia PDF com type=by-state', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockReportsService.generateCompaniesReport.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.companiesReport('by-state', res as any);
      expect(mockReportsService.generateCompaniesReport).toHaveBeenCalledWith('by-state');
    });

    it('lança BadRequestException para tipo inválido', async () => {
      await expect(
        controller.companiesReport('invalid', mockRes() as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('employeesReport', () => {
    it('envia PDF com type=full', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockReportsService.generateEmployeesReport.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.employeesReport('full', res as any);
      expect(mockReportsService.generateEmployeesReport).toHaveBeenCalledWith('full');
    });

    it('envia PDF com type=by-function', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockReportsService.generateEmployeesReport.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.employeesReport('by-function', res as any);
      expect(mockReportsService.generateEmployeesReport).toHaveBeenCalledWith('by-function');
    });

    it('lança BadRequestException para tipo inválido', async () => {
      await expect(
        controller.employeesReport('invalid', mockRes() as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('studentsReport', () => {
    it('envia PDF com type=full', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockReportsService.generateStudentsReport.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.studentsReport('full', res as any);
      expect(mockReportsService.generateStudentsReport).toHaveBeenCalledWith('full');
    });

    it('envia PDF com type=with-notes', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockReportsService.generateStudentsReport.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.studentsReport('with-notes', res as any);
      expect(mockReportsService.generateStudentsReport).toHaveBeenCalledWith('with-notes');
    });

    it('lança BadRequestException para tipo inválido', async () => {
      await expect(
        controller.studentsReport('invalid', mockRes() as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('questionnairesReport', () => {
    it('envia PDF com type=full', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockReportsService.generateQuestionnairesReport.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.questionnairesReport('full', res as any);
      expect(mockReportsService.generateQuestionnairesReport).toHaveBeenCalledWith('full');
    });

    it('envia PDF com type=responses', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockReportsService.generateQuestionnairesReport.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.questionnairesReport('responses', res as any);
      expect(mockReportsService.generateQuestionnairesReport).toHaveBeenCalledWith('responses');
    });

    it('lança BadRequestException para tipo inválido', async () => {
      await expect(
        controller.questionnairesReport('invalid', mockRes() as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
