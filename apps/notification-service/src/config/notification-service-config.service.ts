import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationServiceEnvironmentVariables } from './env.validation';

@Injectable()
export class NotificationServiceConfigService {
  constructor(
    private readonly configService: ConfigService<
      NotificationServiceEnvironmentVariables,
      true
    >,
  ) {}

  get httpPort(): number {
    return this.configService.get('NOTIFICATION_SERVICE_HTTP_PORT') ?? 3002;
  }

  get redisHost(): string {
    return this.configService.get('REDIS_HOST') ?? 'localhost';
  }

  get redisPort(): number {
    return this.configService.get('REDIS_PORT') ?? 6379;
  }

  get rabbitmqUrl(): string {
    return (
      this.configService.get('RABBITMQ_URL') ??
      'amqp://test:test@localhost:5672'
    );
  }

  get rabbitPrefetch(): number {
    return this.configService.get('RABBIT_PREFETCH') ?? 10;
  }

  get welcomeDelayMs(): number {
    return this.configService.get('WELCOME_PUSH_DELAY_MS') ?? 10_000;
  }

  get pushWebhookUrl(): string {
    return this.configService.get('PUSH_WEBHOOK_URL');
  }

  get pushTimeoutMs(): number {
    return this.configService.get('PUSH_TIMEOUT_MS') ?? 5_000;
  }
}
