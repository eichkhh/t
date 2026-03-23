import { OutboxEventType } from '@shared/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OutboxStatus } from '../enums/outbox-status.enum';

@Index(['status', 'createdAt'], {
  where: `"status" = '${OutboxStatus.PENDING}'`,
})
@Entity({ name: 'outbox' })
export class OutboxEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  type!: OutboxEventType;

  @Column({ name: 'payload_json', type: 'jsonb' })
  payloadJson!: unknown;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: 'text', default: OutboxStatus.PENDING })
  status!: OutboxStatus;

  @Column({ name: 'attempts', default: 0 })
  attempts!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @Column({ name: 'claimed_at', type: 'timestamptz', nullable: true })
  claimedAt!: Date | null;
}
