import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateAnswerDto {
  @IsInt()
  @IsNotEmpty()
  pergunta_id: number;

  @IsInt()
  @IsNotEmpty()
  aluno_id: number;

  @IsString()
  @IsOptional()
  resposta_texto?: string;

  @IsString()
  @IsOptional()
  resposta_opcao?: string;

  @IsDateString()
  @IsNotEmpty()
  data_entrada: string;

  @IsDateString()
  @IsNotEmpty()
  data_avaliacao: string;

  @IsInt()
  @IsNotEmpty()
  professor_id: number;
}

