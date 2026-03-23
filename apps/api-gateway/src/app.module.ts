import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ObrioCommonModule, validateEnv } from '@shared/common';
import { ApiGatewayConfigModule } from './config/config.module';
import { ApiGatewayEnvironmentVariables } from './config/env.validation';
import { GrpcExceptionFilter } from './filters/grpc-exception.filter';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateEnv(config, ApiGatewayEnvironmentVariables),
    }),
    ObrioCommonModule.forRoot('api-gateway'),
    ApiGatewayConfigModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_FILTER, useClass: GrpcExceptionFilter }],
})
export class AppModule {}
