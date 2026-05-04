import { Test, TestingModule } from '@nestjs/testing';
import { SmtpConfigController } from './smtp-config.controller';
import { SmtpConfigService } from './smtp-config.service';

const mockService = {
  getConfig: jest.fn(),
  saveConfig: jest.fn(),
  testConnection: jest.fn(),
};

describe('SmtpConfigController', () => {
  let controller: SmtpConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmtpConfigController],
      providers: [{ provide: SmtpConfigService, useValue: mockService }],
    }).compile();

    controller = module.get<SmtpConfigController>(SmtpConfigController);
    jest.clearAllMocks();
  });

  it('getConfig chama service.getConfig', async () => {
    mockService.getConfig.mockResolvedValue({ success: true, data: null });
    await controller.getConfig();
    expect(mockService.getConfig).toHaveBeenCalled();
  });

  it('saveConfig chama service.saveConfig com o DTO', async () => {
    const dto = { host: 'smtp.test.com', port: 587 } as any;
    mockService.saveConfig.mockResolvedValue({ success: true });
    await controller.saveConfig(dto);
    expect(mockService.saveConfig).toHaveBeenCalledWith(dto);
  });

  it('testConnection chama service.testConnection com o DTO', async () => {
    const dto = { host: 'smtp.test.com', port: 587 } as any;
    mockService.testConnection.mockResolvedValue({ success: true });
    await controller.testConnection(dto);
    expect(mockService.testConnection).toHaveBeenCalledWith(dto);
  });
});
