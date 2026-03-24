import { Injectable, OnModuleInit } from '@nestjs/common';
import { context, propagation } from '@opentelemetry/api';
import { AppLogger, ScopedLogger } from '@shared/common';
import { USER_REGISTERED_QUEUE } from '@shared/contracts';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { NotificationServiceConfigService } from '../config/notification-service-config.service';
import { MessageHandlerRegistry } from './message-handler.registry';
import { RabbitConnectionService } from './rabbit-connection.service';

interface DomainMessage {
  eventType: string;
  payload: unknown;
}

@Injectable()
export class RabbitConsumerService implements OnModuleInit {
  private readonly logger: ScopedLogger;

  constructor(
    private readonly rabbitConnection: RabbitConnectionService,
    private readonly registry: MessageHandlerRegistry,
    logger: AppLogger,
    private readonly config: NotificationServiceConfigService,
  ) {
    this.logger = logger.withContext(RabbitConsumerService.name);
  }

  async onModuleInit(): Promise<void> {
    await this.rabbitConnection.channelWrapper.addSetup(
      (channel: ConfirmChannel) => this.setupConsumer(channel),
    );
    this.logger.log('RabbitMQ consumer ready');
  }

  private async setupConsumer(channel: ConfirmChannel): Promise<void> {
    await channel.prefetch(this.config.rabbitPrefetch);
    await channel.consume(USER_REGISTERED_QUEUE, (msg) => {
      if (!msg) return;
      void this.handleMessage(channel, msg).catch((err) => {
        this.logger.error(
          'Unhandled consumer error',
          err instanceof Error ? err.stack : String(err),
        );
      });
    });
  }

  private async handleMessage(
    channel: ConfirmChannel,
    msg: ConsumeMessage,
  ): Promise<void> {
    const carrier = (msg.properties.headers ?? {}) as Record<string, string>;
    const parentCtx = propagation.extract(context.active(), carrier);

    await context.with(parentCtx, async () => {
      try {
        const { eventType, payload } = JSON.parse(
          msg.content.toString(),
        ) as DomainMessage;

        await this.registry.dispatch(eventType, payload);
        channel.ack(msg);
      } catch (err) {
        this.logger.error(
          'Failed to dispatch message; nack to DLQ',
          err instanceof Error ? err.stack : String(err),
        );

        channel.nack(msg, false, false);
      }
    });
  }
}
