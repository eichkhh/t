import { BaseEnvironmentVariables } from '@shared/common';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ApiGatewayEnvironmentVariables extends BaseEnvironmentVariables {
  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  API_GATEWAY_HTTP_PORT: number = 3000;

  @IsString()
  @IsOptional()
  USER_SERVICE_GRPC_URL: string = 'localhost:50051';
}
