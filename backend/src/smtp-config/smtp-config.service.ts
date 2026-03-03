import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmtpConfig } from './entities/smtp-config.entity';
import { SmtpConfigDto } from './dto/smtp-config.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpConfigService {
  constructor(
    @InjectRepository(SmtpConfig)
    private smtpConfigRepository: Repository<SmtpConfig>,
    private configService: ConfigService,
  ) {}

  async getConfig() {
    const configs = await this.smtpConfigRepository.find();
    const config = configs.length > 0 ? configs[0] : null;

    return {
      success: true,
      message: 'Configuração SMTP recuperada com sucesso',
      data: config,
    };
  }

  async saveConfig(smtpConfigDto: SmtpConfigDto) {
    let config = await this.smtpConfigRepository.findOne({ where: {} });

    if (config) {
      Object.assign(config, smtpConfigDto);
    } else {
      config = this.smtpConfigRepository.create(smtpConfigDto);
    }

    const saved = await this.smtpConfigRepository.save(config);

    return {
      success: true,
      message: 'Configuração SMTP salva com sucesso',
      data: saved,
    };
  }

  async testConnection(smtpConfigDto: SmtpConfigDto) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpConfigDto.host,
        port: smtpConfigDto.port,
        secure: smtpConfigDto.secure ?? true,
        auth: {
          user: smtpConfigDto.user,
          pass: smtpConfigDto.password,
        },
      });

      await transporter.verify();

      return {
        success: true,
        message: 'Conexão SMTP testada com sucesso',
        data: null,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Falha ao testar conexão SMTP: ${error.message}`,
      );
    }
  }

  /**
   * Obtém configuração SMTP: primeiro do banco (smtp_configs), depois das variáveis de ambiente (fallback para Docker/Mailpit).
   */
  private async getSmtpOptions(): Promise<{
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
    from: string;
  } | null> {
    const configResult = await this.getConfig();
    const config = configResult.data as SmtpConfig | null;

    if (config?.host) {
      return {
        host: config.host,
        port: config.port,
        secure: config.secure ?? false,
        auth: { user: config.user, pass: config.password },
        from: config.from,
      };
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    if (!host || !port) return null;

    return {
      host,
      port: Number(port),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER') ?? '',
        pass: this.configService.get<string>('SMTP_PASSWORD') ?? '',
      },
      from: this.configService.get<string>('SMTP_FROM') ?? 'noreply@localhost',
    };
  }

  async sendEmail(to: string, subject: string, html: string) {
    const options = await this.getSmtpOptions();

    if (!options) {
      throw new InternalServerErrorException(
        'Configuração SMTP não encontrada. Configure em /smtp-config ou defina SMTP_HOST e SMTP_PORT no ambiente.',
      );
    }

    try {
      const transporter = nodemailer.createTransport({
        host: options.host,
        port: options.port,
        secure: options.secure,
        auth: options.auth.user ? options.auth : undefined,
      });

      await transporter.sendMail({
        from: options.from,
        to,
        subject,
        html,
      });

      return {
        success: true,
        message: 'Email enviado com sucesso',
        data: null,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Falha ao enviar email: ${error.message}`,
      );
    }
  }
}

