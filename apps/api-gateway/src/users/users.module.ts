import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  DEFAULT_DEADLINE_MS,
  grpcCorrelationInterceptor,
  grpcDeadlineInterceptor,
} from '@shared/common';
import { join } from 'node:path';
import { ApiGatewayConfigService } from '../config/api-gateway-config.service';
import { ApiGatewayConfigModule } from '../config/config.module';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE_GRPC',
        imports: [ApiGatewayConfigModule],
        inject: [ApiGatewayConfigService],
        useFactory: (configService: ApiGatewayConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'user',
            protoPath: join(
              __dirname,
              '..',
              '..',
              'proto',
              'user-service.proto',
            ),
            url: configService.userServiceGrpcUrl,
            channelOptions: {
              interceptors: [
                grpcCorrelationInterceptor,
                grpcDeadlineInterceptor(DEFAULT_DEADLINE_MS),
              ],
            },
          },
        }),
      },
    ]),
  ],
  controllers: [UsersController],
})
export class UsersModule {}
