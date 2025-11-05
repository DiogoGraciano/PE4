import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razao_social: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  cnpj: string;

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
}

