import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async sendEmail(to: string, subject: string, html: string) {
    const configResult = await this.getConfig();
    const config = configResult.data;

    if (!config) {
      throw new InternalServerErrorException(
        'Configuração SMTP não encontrada',
      );
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });

      await transporter.sendMail({
        from: config.from,
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

