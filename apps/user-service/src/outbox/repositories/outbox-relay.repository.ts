import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OutboxEvent } from '../entities/outbox-event.entity';
import { OutboxStatus } from '../enums/outbox-status.enum';
import type { IOutboxRelayRepository } from '../interfaces/outbox-relay-repository.interface';
import type { OutboxRow } from '../interfaces/outbox-row.interface';

@Injectable()
export class OutboxRelayRepository implements IOutboxRelayRepository {
  constructor(private readonly dataSource: DataSource) {}

  private statusByAttempts(maxAttempts: number): () => string {
    return () =>
      `CASE WHEN attempts >= ${maxAttempts} THEN '${OutboxStatus.FAILED}' ELSE '${OutboxStatus.PENDING}' END`;
  }

  async claimPending(limit: number, maxAttempts: number): Promise<OutboxRow[]> {
    const [rows] = await this.dataSource.query<
      [
        {
          id: string;
          event_type: string;
          payload_json: unknown;
          metadata: Record<string, unknown> | null;
        }[],
        number,
      ]
    >(
      `
      WITH locked AS (
        SELECT id
        FROM outbox
        WHERE status = $1
          AND attempts < $4
        ORDER BY created_at ASC
        LIMIT $2
        FOR UPDATE SKIP LOCKED
      )
      UPDATE outbox o
      SET
        status     = $3,
        attempts   = o.attempts + 1,
        claimed_at = NOW()
      FROM locked
      WHERE o.id = locked.id
      RETURNING o.id, o."type" AS event_type, o.payload_json, o.metadata
      `,
      [OutboxStatus.PENDING, limit, OutboxStatus.PROCESSING, maxAttempts],
    );

    return rows.map((r) => ({
      id: r.id,
      type: r.event_type,
      payloadJson: r.payload_json,
      metadata: r.metadata,
    }));
  }

  async markProcessed(id: string): Promise<void> {
    await this.dataSource.getRepository(OutboxEvent).update(id, {
      status: OutboxStatus.PROCESSED,
      processedAt: new Date(),
      claimedAt: null,
    });
  }

  async requeue(id: string, maxAttempts: number): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(OutboxEvent)
      .set({ status: this.statusByAttempts(maxAttempts), claimedAt: null })
      .where('id = :id', { id })
      .execute();
  }

  async recoverStuck(
    processingTtlSeconds: number,
    maxAttempts: number,
  ): Promise<{ id: string }[]> {
    const threshold = new Date(Date.now() - processingTtlSeconds * 1000);
    const result = await this.dataSource
      .createQueryBuilder()
      .update(OutboxEvent)
      .set({ status: this.statusByAttempts(maxAttempts), claimedAt: null })
      .where('status = :status', { status: OutboxStatus.PROCESSING })
      .andWhere('claimed_at IS NOT NULL')
      .andWhere('claimed_at < :threshold', { threshold })
      .returning('id')
      .execute();
    return result.raw as { id: string }[];
  }
}
