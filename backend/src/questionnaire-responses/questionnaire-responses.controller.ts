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
import { QuestionnaireResponsesService } from './questionnaire-responses.service';
import { CreateQuestionnaireResponseDto } from './dto/create-questionnaire-response.dto';
import { UpdateQuestionnaireResponseDto } from './dto/update-questionnaire-response.dto';

@ApiTags('Questionnaire Responses')
@ApiBearerAuth()
@Controller('questionnaire-responses')
@Roles(Role.ADM, Role.COORD, Role.PROF)
export class QuestionnaireResponsesController {
  constructor(
    private readonly questionnaireResponsesService: QuestionnaireResponsesService,
  ) {}

  @Post()
  create(
    @Body() createQuestionnaireResponseDto: CreateQuestionnaireResponseDto,
  ) {
    return this.questionnaireResponsesService.create(
      createQuestionnaireResponseDto,
    );
  }

  @Get()
  findAll(@Query('questionnaire_id') questionnaireId?: string) {
    return this.questionnaireResponsesService.findAll(
      questionnaireId ? +questionnaireId : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionnaireResponsesService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionnaireResponseDto: UpdateQuestionnaireResponseDto,
  ) {
    return this.questionnaireResponsesService.update(
      +id,
      updateQuestionnaireResponseDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionnaireResponsesService.remove(+id);
  }
}

