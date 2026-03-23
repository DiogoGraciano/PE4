import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';

@ApiTags('Questionnaires')
@ApiBearerAuth()
@Controller('questionnaires')
@Roles(Role.ADM, Role.COORD, Role.PROF)
export class QuestionnairesController {
  constructor(
    private readonly questionnairesService: QuestionnairesService,
  ) {}

  @Post()
  create(@Body() createQuestionnaireDto: CreateQuestionnaireDto) {
    return this.questionnairesService.create(createQuestionnaireDto);
  }

  @Get()
  findAll() {
    return this.questionnairesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionnairesService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionnaireDto: UpdateQuestionnaireDto,
  ) {
    return this.questionnairesService.update(+id, updateQuestionnaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionnairesService.remove(+id);
  }
}

