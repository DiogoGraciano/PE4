import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionsService } from './functions.service';
import { FunctionsController } from './functions.controller';
import { Function as FunctionEntity } from './entities/function.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FunctionEntity])],
  controllers: [FunctionsController],
  providers: [FunctionsService],
  exports: [FunctionsService],
})
export class FunctionsModule {}

