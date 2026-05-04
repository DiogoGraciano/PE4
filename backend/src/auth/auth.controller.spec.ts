import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('login delega para authService.login', async () => {
    const dto = { email: 'a@a.com', password: 'pass' };
    mockAuthService.login.mockResolvedValue({ token: 'jwt', user: {} });

    await controller.login(dto as any);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('logout delega para authService.logout', async () => {
    mockAuthService.logout.mockResolvedValue({ message: 'ok' });

    await controller.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('forgotPassword delega para authService.forgotPassword', async () => {
    const dto = { email: 'a@a.com' };
    mockAuthService.forgotPassword.mockResolvedValue({ success: true });

    await controller.forgotPassword(dto as any);
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
  });

  it('resetPassword delega para authService.resetPassword', async () => {
    const dto = { token: 'abc', password: 'newpass' };
    mockAuthService.resetPassword.mockResolvedValue({ success: true });

    await controller.resetPassword(dto as any);
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
  });
});
