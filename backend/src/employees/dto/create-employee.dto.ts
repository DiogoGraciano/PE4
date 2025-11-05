import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEmail,
  MinLength,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  cpf: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  cep: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cidade: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  estado: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bairro: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pais: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numero_endereco: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  complemento?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contato_empresarial?: string;

  @IsInt()
  @IsOptional()
  funcao_id?: number;
}

