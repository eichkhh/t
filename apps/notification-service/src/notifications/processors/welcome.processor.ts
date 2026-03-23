import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  AppLogger,
  runWithOtelContext,
  type OtelCarrier,
} from '@shared/common';
import { WELCOME_QUEUE } from '@shared/contracts';
import { Job } from 'bullmq';
import { PUSH_SERVICE, type IPushService } from '../interfaces/push.interface';

export interface WelcomeJobData {
  userId: string;
  userName: string;
  otelCarrier: OtelCarrier;
}

const TRACER_NAME = 'notification-service';

@Injectable()
@Processor(WELCOME_QUEUE, { concurrency: 10 })
export class WelcomeProcessor extends WorkerHost {
  constructor(
    @Inject(PUSH_SERVICE) private readonly push: IPushService,
    private readonly logger: AppLogger,
  ) {
    super();
  }

  async process(job: Job<WelcomeJobData>): Promise<void> {
    const { userId, userName, otelCarrier } = job.data;

    await runWithOtelContext(
      otelCarrier,
      'welcome-job',
      TRACER_NAME,
      async () => {
        this.logger.log('Welcome job start', { jobId: job.id, userId });

        await this.push.sendWelcome(userId, userName);

        this.logger.log('Welcome push completed', { jobId: job.id, userId });
      },
    );
  }
}
