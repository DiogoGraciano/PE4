import { Controller, Get, Post, Body } from '@nestjs/common';
import { SmtpConfigService } from './smtp-config.service';
import { SmtpConfigDto } from './dto/smtp-config.dto';

@Controller()
export class SmtpConfigController {
  constructor(private readonly smtpConfigService: SmtpConfigService) {}

  @Get('smtp-config')
  getConfig() {
    return this.smtpConfigService.getConfig();
  }

  @Post('smtp-config')
  saveConfig(@Body() smtpConfigDto: SmtpConfigDto) {
    return this.smtpConfigService.saveConfig(smtpConfigDto);
  }

  @Post('smtp-config-test')
  testConnection(@Body() smtpConfigDto: SmtpConfigDto) {
    return this.smtpConfigService.testConnection(smtpConfigDto);
  }
}

