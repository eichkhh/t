import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AppLogger, getCorrelationId } from '@shared/common';
import {
  OutboxEventType,
  WELCOME_QUEUE,
  type UserRegisteredPayload,
} from '@shared/contracts';
import type { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { NotificationServiceConfigService } from '../../config/notification-service-config.service';
import type { IMessageHandler } from '../../rabbitmq/interfaces/message-handler.interface';
import type { WelcomeJobData } from '../processors/welcome.processor';

@Injectable()
export class UserRegisteredHandler implements IMessageHandler {
  readonly eventType = OutboxEventType.USER_REGISTERED as string;

  constructor(
    @InjectQueue(WELCOME_QUEUE)
    private readonly welcomeQueue: Queue<WelcomeJobData>,
    private readonly logger: AppLogger,
    private readonly config: NotificationServiceConfigService,
  ) {}

  async handle(payload: UserRegisteredPayload): Promise<void> {
    const jobId = `welcome_push_${payload.userId}`;

    await this.welcomeQueue.add(
      'welcome',
      {
        userId: payload.userId,
        userName: payload.name,
        correlationId: getCorrelationId() ?? randomUUID(),
      },
      {
        jobId,
        delay: this.config.welcomeDelayMs,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Welcome job queued userId=${payload.userId} jobId=${jobId}`,
    );
  }
}
