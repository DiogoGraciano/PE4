import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { FunctionsService } from './functions.service';

@Controller('functions')
@Roles(Role.ADM, Role.RH, Role.COORD, Role.PROF, Role.DIR)
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  @Get()
  findAll() {
    return this.functionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.functionsService.findOne(+id);
  }
}
