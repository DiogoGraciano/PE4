import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SmtpConfigService } from '../smtp-config/smtp-config.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private smtpConfigService: SmtpConfigService,
  ) {}

  async validateEmployee(email: string, password: string): Promise<any> {
    const employee = await this.employeesRepository.findOne({
      where: { email },
      relations: ['funcao'],
    });

    if (!employee) {
      return null;
    }

    const isPasswordValid = await employee.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    const { senha, ...result } = employee;
    return result;
  }

  async login(loginDto: LoginDto) {
    const employee = await this.validateEmployee(
      loginDto.email,
      loginDto.password,
    );

    if (!employee) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { email: employee.email, sub: employee.id };

    return {
      user: employee,
      token: this.jwtService.sign(payload),
    };
  }

  async logout() {
    // No server-side action needed for JWT logout
    // Client should remove the token
    return { message: 'Logout realizado com sucesso' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const employee = await this.employeesRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!employee) {
      // Por segurança, não revela se o email existe ou não
      return {
        success: true,
        message:
          'Se o email existir, um link de recuperação será enviado',
        data: null,
      };
    }

    // Gera token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token válido por 1 hora

    employee.reset_password_token = resetToken;
    employee.reset_password_expires = resetTokenExpiry;
    await this.employeesRepository.save(employee);

    // Envia email
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const emailHtml = `
      <h1>Recuperação de Senha</h1>
      <p>Olá ${employee.nome},</p>
      <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetUrl}">Redefinir Senha</a>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou esta recuperação, ignore este email.</p>
    `;

    try {
      await this.smtpConfigService.sendEmail(
        employee.email,
        'Recuperação de Senha',
        emailHtml,
      );
    } catch (error) {
      // Log do erro mas não revela ao usuário
      console.error('Erro ao enviar email:', error);
    }

    return {
      success: true,
      message: 'Se o email existir, um link de recuperação será enviado',
      data: null,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const employee = await this.employeesRepository.findOne({
      where: {
        reset_password_token: resetPasswordDto.token,
        reset_password_expires: MoreThan(new Date()),
      },
    });

    if (!employee) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    employee.senha = resetPasswordDto.password;
    employee.reset_password_token = null;
    employee.reset_password_expires = null;
    await this.employeesRepository.save(employee);

    return {
      success: true,
      message: 'Senha redefinida com sucesso',
      data: null,
    };
  }
}

