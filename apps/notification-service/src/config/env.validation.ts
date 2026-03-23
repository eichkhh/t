import { BaseEnvironmentVariables } from '@shared/common';
import { IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class NotificationServiceEnvironmentVariables extends BaseEnvironmentVariables {
  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsInt()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  RABBITMQ_URL?: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  NOTIFICATION_SERVICE_HTTP_PORT: number = 3002;

  @IsInt()
  @IsOptional()
  WELCOME_PUSH_DELAY_MS: number = 10000;

  @IsInt()
  @IsOptional()
  RABBIT_PREFETCH: number = 10;

  @IsUrl()
  PUSH_WEBHOOK_URL!: string;

  @IsInt()
  @Min(1000)
  @IsOptional()
  PUSH_TIMEOUT_MS: number = 5000;
}
