import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Employee } from '../employees/entities/employee.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SmtpConfigModule } from '../smtp-config/smtp-config.module';
import { APP_GUARD } from '@nestjs/core';
import type { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    PassportModule,
    SmtpConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') || '1h') as StringValue;
        const signOptions: SignOptions = {
          expiresIn: expiresIn,
        };
        return {
          secret: configService.get<string>('JWT_SECRET') || 'default-secret',
          signOptions,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}

