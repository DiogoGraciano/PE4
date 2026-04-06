import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateReferralDto {
  @IsInt()
  @IsNotEmpty()
  aluno_id: number;

  @IsInt()
  @IsNotEmpty()
  empresa_id: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  funcao?: string;

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

  @IsString()
  @IsOptional()
  observacao?: string;
}
