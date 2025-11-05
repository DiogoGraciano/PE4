import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsString()
  @IsOptional()
  @MinLength(6)
  senha?: string;
}

