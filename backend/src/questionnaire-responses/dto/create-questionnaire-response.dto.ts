import { IsNotEmpty, IsInt, IsString, IsDateString } from 'class-validator';

export class CreateQuestionnaireResponseDto {
  @IsInt()
  @IsNotEmpty()
  questionario_id: number;

  @IsInt()
  @IsNotEmpty()
  aluno_id: number;

  @IsString()
  @IsNotEmpty()
  respostas_json: string;

  @IsDateString()
  @IsNotEmpty()
  data_envio: string;
}

