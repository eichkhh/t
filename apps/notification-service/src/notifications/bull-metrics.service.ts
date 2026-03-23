import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { metrics } from '@opentelemetry/api';
import { WELCOME_QUEUE } from '@shared/contracts';
import { Queue } from 'bullmq';

@Injectable()
export class BullMetricsService implements OnModuleInit {
  constructor(@InjectQueue(WELCOME_QUEUE) private readonly queue: Queue) {}

  onModuleInit(): void {
    const meter = metrics.getMeter('bullmq');

    meter
      .createObservableGauge('bullmq_jobs', {
        description: 'Number of BullMQ jobs grouped by queue and state',
      })
      .addCallback(async (result) => {
        const counts = await this.queue.getJobCounts(
          'waiting',
          'active',
          'delayed',
          'failed',
          'completed',
          'paused',
        );

        for (const [state, count] of Object.entries(counts)) {
          result.observe(count, { queue: WELCOME_QUEUE, state });
        }
      });
  }
}
