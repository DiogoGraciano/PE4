import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { StudentsModule } from './students/students.module';
import { CompaniesModule } from './companies/companies.module';
import { FunctionsModule } from './functions/functions.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { QuestionnaireResponsesModule } from './questionnaire-responses/questionnaire-responses.module';
import { SmtpConfigModule } from './smtp-config/smtp-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    AuthModule,
    EmployeesModule,
    StudentsModule,
    CompaniesModule,
    FunctionsModule,
    QuestionnairesModule,
    QuestionsModule,
    AnswersModule,
    QuestionnaireResponsesModule,
    SmtpConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
