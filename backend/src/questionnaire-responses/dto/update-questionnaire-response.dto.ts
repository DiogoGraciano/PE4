import { PartialType } from '@nestjs/swagger';
import { CreateQuestionnaireResponseDto } from './create-questionnaire-response.dto';

export class UpdateQuestionnaireResponseDto extends PartialType(
  CreateQuestionnaireResponseDto,
) {}

