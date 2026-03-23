import { BaseEnvironmentVariables } from '@shared/common';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UserServiceEnvironmentVariables extends BaseEnvironmentVariables {
  @IsString()
  @IsOptional()
  POSTGRES_HOST?: string;

  @IsInt()
  @IsOptional()
  POSTGRES_PORT?: number;

  @IsString()
  @IsOptional()
  POSTGRES_USER?: string;

  @IsString()
  @IsOptional()
  POSTGRES_PASSWORD?: string;

  @IsString()
  @IsOptional()
  POSTGRES_DB?: string;

  @IsBoolean()
  @IsOptional()
  TYPEORM_LOGGING: boolean = false;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  USER_SERVICE_HTTP_PORT: number = 3001;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  GRPC_PORT: number = 50051;

  @IsString()
  @IsOptional()
  RABBITMQ_URL?: string;

  @IsInt()
  @IsOptional()
  OUTBOX_BATCH_SIZE: number = 10;

  @IsInt()
  @Min(10)
  @IsOptional()
  OUTBOX_PROCESSING_TTL_SECONDS: number = 60;
}
