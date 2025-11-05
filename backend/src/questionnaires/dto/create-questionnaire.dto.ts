import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateQuestionnaireDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @IsString()
  @IsNotEmpty()
  questionario_json: string;
}

