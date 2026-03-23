import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  connect,
  type AmqpConnectionManager,
  type ChannelWrapper,
} from 'amqp-connection-manager';
import type { ConfirmChannel } from 'amqplib';
import { AppLogger } from '../observability/app-logger';

@Injectable()
export abstract class AbstractRabbitConnectionService
  implements OnModuleInit, OnModuleDestroy
{
  private connection!: AmqpConnectionManager;
  private _channelWrapper!: ChannelWrapper;

  constructor(protected readonly logger: AppLogger) {}

  get channelWrapper(): ChannelWrapper {
    return this._channelWrapper;
  }

  protected abstract getRabbitmqUrl(): string;
  protected abstract isJsonMode(): boolean;
  protected abstract setupTopology(channel: ConfirmChannel): Promise<void>;

  async onModuleInit(): Promise<void> {
    this.connection = connect([this.getRabbitmqUrl()], {
      reconnectTimeInSeconds: 5,
    });

    this._channelWrapper = this.connection.createChannel({
      json: this.isJsonMode(),
      setup: (channel: ConfirmChannel) => this.setupTopology(channel),
    });

    await this._channelWrapper.waitForConnect();
    this.logger.log('RabbitMQ connection and topology ready');
  }

  async onModuleDestroy(): Promise<void> {
    await this._channelWrapper?.close();
    await this.connection?.close();
  }
}
