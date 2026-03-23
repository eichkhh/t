import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OutboxEvent } from '../entities/outbox-event.entity';
import { OutboxStatus } from '../enums/outbox-status.enum';
import type { IOutboxRelayRepository } from '../interfaces/outbox-relay-repository.interface';
import type { OutboxRow } from '../interfaces/outbox-row.interface';

@Injectable()
export class OutboxRelayRepository implements IOutboxRelayRepository {
  constructor(private readonly dataSource: DataSource) {}

  async claimPending(limit: number): Promise<OutboxRow[]> {
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      const pending = await qr.manager
        .createQueryBuilder(OutboxEvent, 'event')
        .select([
          'event.id',
          'event.type',
          'event.payloadJson',
          'event.metadata',
        ])
        .where('event.status = :status', { status: OutboxStatus.PENDING })
        .orderBy('event.createdAt', 'ASC')
        .limit(limit)
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .getMany();

      if (pending.length === 0) {
        await qr.commitTransaction();
        return [];
      }

      await qr.manager
        .createQueryBuilder()
        .update(OutboxEvent)
        .set({
          status: OutboxStatus.PROCESSING,
          attempts: () => 'attempts + 1',
          claimedAt: () => 'NOW()',
        })
        .whereInIds(pending.map((e) => e.id))
        .execute();

      await qr.commitTransaction();
      return pending;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
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
      .set({
        status: () =>
          `CASE WHEN attempts >= ${maxAttempts} THEN '${OutboxStatus.FAILED}' ELSE '${OutboxStatus.PENDING}' END`,
        claimedAt: null,
      })
      .where('id = :id', { id })
      .execute();
  }

  async recoverStuck(processingTtlSeconds: number): Promise<{ id: string }[]> {
    const threshold = new Date(Date.now() - processingTtlSeconds * 1000);
    const result = await this.dataSource
      .createQueryBuilder()
      .update(OutboxEvent)
      .set({ status: OutboxStatus.PENDING, claimedAt: null })
      .where('status = :status', { status: OutboxStatus.PROCESSING })
      .andWhere('claimed_at IS NOT NULL')
      .andWhere('claimed_at < :threshold', { threshold })
      .returning('id')
      .execute();
    return result.raw as { id: string }[];
  }
}
