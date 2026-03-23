import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiGatewayEnvironmentVariables } from './env.validation';

@Injectable()
export class ApiGatewayConfigService {
  constructor(
    private readonly configService: ConfigService<
      ApiGatewayEnvironmentVariables,
      true
    >,
  ) {}

  get httpPort(): number {
    return this.configService.get('API_GATEWAY_HTTP_PORT');
  }

  get userServiceGrpcUrl(): string {
    return this.configService.get('USER_SERVICE_GRPC_URL');
  }
}
