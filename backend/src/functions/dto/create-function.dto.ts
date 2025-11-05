import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFunctionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome_funcao: string;
}

