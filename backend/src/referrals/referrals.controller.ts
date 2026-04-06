import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

@ApiTags('Referrals')
@ApiBearerAuth()
@Controller('referrals')
@Roles(Role.ADM, Role.COORD, Role.PROF, Role.RH)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  create(@Body() createReferralDto: CreateReferralDto) {
    return this.referralsService.create(createReferralDto);
  }

  @Get()
  findAll(@Query('aluno_id') alunoId?: string) {
    return this.referralsService.findAll(alunoId ? +alunoId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.referralsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateReferralDto: UpdateReferralDto,
  ) {
    return this.referralsService.update(+id, updateReferralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.referralsService.remove(+id);
  }
}
