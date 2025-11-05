import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionnaireResponsesService } from './questionnaire-responses.service';
import { QuestionnaireResponsesController } from './questionnaire-responses.controller';
import { QuestionnaireResponse } from './entities/questionnaire-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionnaireResponse])],
  controllers: [QuestionnaireResponsesController],
  providers: [QuestionnaireResponsesService],
  exports: [QuestionnaireResponsesService],
})
export class QuestionnaireResponsesModule {}

