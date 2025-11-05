import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class SmtpConfigDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  @IsNotEmpty()
  port: number;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsBoolean()
  @IsOptional()
  secure?: boolean;
}

