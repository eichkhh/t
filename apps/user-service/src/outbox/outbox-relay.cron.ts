import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxRelayService } from './outbox-relay.service';

@Injectable()
export class OutboxRelayCron {
  constructor(private readonly relay: OutboxRelayService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async tick(): Promise<void> {
    await this.relay.relayBatch();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async recover(): Promise<void> {
    await this.relay.recoverStuck();
  }
}
