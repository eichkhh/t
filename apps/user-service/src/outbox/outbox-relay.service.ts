import { Inject, Injectable } from '@nestjs/common';
import {
  AppLogger,
  AppMetrics,
  type OtelCarrier,
  runWithOtelContext,
} from '@shared/common';
import { UserServiceConfigService } from '../config/user-service-config.service';
import type { IEventPublisher } from './interfaces/event-publisher.interface';
import { EVENT_PUBLISHER } from './interfaces/event-publisher.interface';
import type { IOutboxRelayRepository } from './interfaces/outbox-relay-repository.interface';
import { OUTBOX_RELAY_REPOSITORY } from './interfaces/outbox-relay-repository.interface';

const DEFAULT_MAX_ATTEMPTS = 5;
const TRACER_NAME = 'user-service';

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
    private readonly metrics: AppMetrics,
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
          const carrier = (row.metadata?.otelCarrier ?? {}) as OtelCarrier;

          return runWithOtelContext(
            carrier,
            'outbox.relay',
            TRACER_NAME,
            async () => {
              try {
                await this.publisher.publish(row);
                await this.relayRepo.markProcessed(row.id);

                this.metrics.outboxRelayTotal.add(1, { status: 'success' });
                this.logger.log('Outbox published to RabbitMQ', {
                  outboxId: row.id,
                });
              } catch (err) {
                await this.relayRepo.requeue(row.id, this.maxAttempts);

                this.metrics.outboxRelayTotal.add(1, { status: 'failed' });
                this.logger.error('Outbox relay failed', {
                  outboxId: row.id,
                  stack: err instanceof Error ? err.stack : String(err),
                });
              }
            },
          );
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
        this.metrics.outboxRecoveredTotal.add(recovered.length);

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
