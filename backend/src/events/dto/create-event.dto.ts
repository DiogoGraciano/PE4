import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsEnum,
  MaxLength,
} from 'class-validator';

export enum EventTypeEnum {
  VISITA_ALUNO = 'visita_aluno',
  VISITA_EMPRESA = 'visita_empresa',
  VISITA_AMBOS = 'visita_ambos',
  GENERICO = 'generico',
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsDateString()
  @IsNotEmpty()
  data_inicio: string;

  @IsDateString()
  @IsNotEmpty()
  data_fim: string;

  @IsEnum(EventTypeEnum)
  @IsNotEmpty()
  tipo: EventTypeEnum;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  local?: string;

  @IsString()
  @IsOptional()
  observacao?: string;

  @IsInt()
  @IsOptional()
  aluno_id?: number;

  @IsInt()
  @IsOptional()
  empresa_id?: number;
}
