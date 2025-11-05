import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionnaireResponseDto } from './create-questionnaire-response.dto';

export class UpdateQuestionnaireResponseDto extends PartialType(
  CreateQuestionnaireResponseDto,
) {}

