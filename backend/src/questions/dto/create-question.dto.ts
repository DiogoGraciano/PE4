import { IsNotEmpty, IsString, IsInt, IsEnum } from 'class-validator';

export class CreateQuestionDto {
  @IsInt()
  @IsNotEmpty()
  questionario_id: number;

  @IsEnum(['checkbox', 'resposta_curta', 'combobox'])
  @IsNotEmpty()
  tipo_pergunta: 'checkbox' | 'resposta_curta' | 'combobox';

  @IsString()
  @IsNotEmpty()
  texto_pergunta: string;
}

