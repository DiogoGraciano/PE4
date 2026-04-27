import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CompaniesModule } from '../companies/companies.module';
import { EmployeesModule } from '../employees/employees.module';
import { StudentsModule } from '../students/students.module';
import { QuestionnairesModule } from '../questionnaires/questionnaires.module';
import { QuestionnaireResponsesModule } from '../questionnaire-responses/questionnaire-responses.module';

@Module({
  imports: [
    CompaniesModule,
    EmployeesModule,
    StudentsModule,
    QuestionnairesModule,
    QuestionnaireResponsesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
