import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserServiceEnvironmentVariables } from './env.validation';

@Injectable()
export class UserServiceConfigService {
  constructor(
    private readonly configService: ConfigService<
      UserServiceEnvironmentVariables,
      true
    >,
  ) {}

  get postgresHost(): string {
    return this.configService.get('POSTGRES_HOST') ?? 'localhost';
  }

  get postgresPort(): number {
    return this.configService.get('POSTGRES_PORT') ?? 5432;
  }

  get postgresUser(): string {
    return this.configService.get('POSTGRES_USER') ?? 'user';
  }

  get postgresPassword(): string {
    return this.configService.get('POSTGRES_PASSWORD') ?? 'secret';
  }

  get postgresDb(): string {
    return this.configService.get('POSTGRES_DB') ?? 'user_db';
  }

  get typeormLogging(): boolean {
    return this.configService.get('TYPEORM_LOGGING') ?? false;
  }

  get httpPort(): number {
    return this.configService.get('USER_SERVICE_HTTP_PORT') ?? 3001;
  }

  get grpcPort(): number {
    return this.configService.get('GRPC_PORT') ?? 50051;
  }

  get rabbitmqUrl(): string {
    return (
      this.configService.get('RABBITMQ_URL') ??
      'amqp://user:secret@localhost:5672'
    );
  }

  get outboxBatchSize(): number {
    return this.configService.get('OUTBOX_BATCH_SIZE') ?? 10;
  }

  get outboxProcessingTtlSeconds(): number {
    return this.configService.get('OUTBOX_PROCESSING_TTL_SECONDS') ?? 60;
  }
}
