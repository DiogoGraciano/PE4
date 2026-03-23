import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { SmtpConfigService } from './smtp-config.service';
import { SmtpConfigDto } from './dto/smtp-config.dto';

@ApiTags('SMTP Config')
@ApiBearerAuth()
@Controller()
@Roles(Role.ADM)
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

