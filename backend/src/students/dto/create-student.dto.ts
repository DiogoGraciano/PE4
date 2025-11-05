import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  IsDateString,
  IsEmail,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nome?: string;

  @IsString()
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser um endereço de email válido' })
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(14)
  cpf?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  cep?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cidade?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  estado?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  bairro?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  pais?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  numero_endereco?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  complemento?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  responsavel: string;

  @IsString()
  @IsOptional()
  observacao?: string;

  @IsInt()
  @IsOptional()
  empresa_id?: number;

  @IsInt()
  @IsOptional()
  funcao_id?: number;

  @IsDateString()
  @IsOptional()
  data_admissao?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contato_rh?: string;

  @IsDateString()
  @IsOptional()
  data_desligamento?: string;
}

