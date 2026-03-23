import { Injectable } from '@nestjs/common';
import { AbstractRabbitConnectionService, AppLogger } from '@shared/common';
import {
  USER_DLX_EXCHANGE,
  USER_EVENTS_EXCHANGE,
  USER_REGISTERED_DLQ_QUEUE,
  USER_REGISTERED_DLQ_ROUTING_KEY,
  USER_REGISTERED_QUEUE,
  USER_REGISTERED_ROUTING_KEY,
} from '@shared/contracts';
import type { ConfirmChannel } from 'amqplib';
import { NotificationServiceConfigService } from '../config/notification-service-config.service';

@Injectable()
export class RabbitConnectionService extends AbstractRabbitConnectionService {
  constructor(
    logger: AppLogger,
    private readonly config: NotificationServiceConfigService,
  ) {
    super(logger);
  }

  protected getRabbitmqUrl(): string {
    return this.config.rabbitmqUrl;
  }

  protected isJsonMode(): boolean {
    return false;
  }

  protected async setupTopology(channel: ConfirmChannel): Promise<void> {
    await channel.assertExchange(USER_EVENTS_EXCHANGE, 'topic', {
      durable: true,
    });
    await channel.assertExchange(USER_DLX_EXCHANGE, 'direct', {
      durable: true,
    });

    await channel.assertQueue(USER_REGISTERED_DLQ_QUEUE, { durable: true });
    await channel.bindQueue(
      USER_REGISTERED_DLQ_QUEUE,
      USER_DLX_EXCHANGE,
      USER_REGISTERED_DLQ_ROUTING_KEY,
    );

    await channel.assertQueue(USER_REGISTERED_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': USER_DLX_EXCHANGE,
        'x-dead-letter-routing-key': USER_REGISTERED_DLQ_ROUTING_KEY,
      },
    });
    await channel.bindQueue(
      USER_REGISTERED_QUEUE,
      USER_EVENTS_EXCHANGE,
      USER_REGISTERED_ROUTING_KEY,
    );
  }
}
