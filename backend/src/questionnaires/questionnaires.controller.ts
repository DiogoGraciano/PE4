import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';

@Controller('questionnaires')
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

