import { Inject, Injectable } from '@nestjs/common';
import { AppLogger, runWithCorrelation } from '@shared/common';
import { randomUUID } from 'node:crypto';
import { UserServiceConfigService } from '../config/user-service-config.service';
import type { IEventPublisher } from './interfaces/event-publisher.interface';
import { EVENT_PUBLISHER } from './interfaces/event-publisher.interface';
import type { IOutboxRelayRepository } from './interfaces/outbox-relay-repository.interface';
import { OUTBOX_RELAY_REPOSITORY } from './interfaces/outbox-relay-repository.interface';

const DEFAULT_MAX_ATTEMPTS = 5;

@Injectable()
export class OutboxRelayService {
  private readonly batchSize: number;
  private readonly maxAttempts: number;
  private readonly processingTtlSeconds: number;
  private isBatchInProgress = false;
  private isRecoverInProgress = false;

  constructor(
    @Inject(OUTBOX_RELAY_REPOSITORY)
    private readonly relayRepo: IOutboxRelayRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: IEventPublisher,
    private readonly logger: AppLogger,
    private readonly config: UserServiceConfigService,
  ) {
    this.batchSize = this.config.outboxBatchSize;
    this.maxAttempts = DEFAULT_MAX_ATTEMPTS;
    this.processingTtlSeconds = this.config.outboxProcessingTtlSeconds;
  }

  async relayBatch(): Promise<void> {
    if (this.isBatchInProgress) {
      this.logger.warn('relayBatch skipped: previous run still in progress');
      return;
    }
    this.isBatchInProgress = true;
    try {
      const rows = await this.relayRepo.claimPending(this.batchSize);

      await Promise.allSettled(
        rows.map((row) => {
          const correlationId =
            (row.metadata?.correlationId as string | undefined) ?? randomUUID();

          return runWithCorrelation(correlationId, async () => {
            try {
              await this.publisher.publish(row);
              await this.relayRepo.markProcessed(row.id);

              this.logger.log('Outbox published to RabbitMQ', {
                outboxId: row.id,
              });
            } catch (err) {
              await this.relayRepo.requeue(row.id, this.maxAttempts);

              this.logger.error('Outbox relay failed', {
                outboxId: row.id,
                stack: err instanceof Error ? err.stack : String(err),
              });
            }
          });
        }),
      );
    } finally {
      this.isBatchInProgress = false;
    }
  }

  async recoverStuck(): Promise<void> {
    if (this.isRecoverInProgress) return;
    this.isRecoverInProgress = true;

    try {
      const recovered = await this.relayRepo.recoverStuck(
        this.processingTtlSeconds,
      );
      if (recovered.length > 0) {
        this.logger.warn('Recovered stuck outbox rows', {
          count: recovered.length,
          outboxIds: recovered.map((r) => r.id),
        });
      }
    } finally {
      this.isRecoverInProgress = false;
    }
  }
}
