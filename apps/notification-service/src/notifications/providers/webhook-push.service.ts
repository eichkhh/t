import { Injectable } from '@nestjs/common';
import { AppLogger, ScopedLogger } from '@shared/common';
import type { IPushService } from '../interfaces/push.interface';
import { PushHttpClient } from './push-http.client';

@Injectable()
export class WebhookPushService implements IPushService {
  private readonly logger: ScopedLogger;

  constructor(
    private readonly client: PushHttpClient,
    logger: AppLogger,
  ) {
    this.logger = logger.withContext(WebhookPushService.name);
  }

  async sendWelcome(userId: string, name: string): Promise<void> {
    this.logger.log('Sending welcome push', { userId });

    await this.client.post({
      event: 'welcome_push',
      userId,
      name,
      sentAt: new Date().toISOString(),
    });

    this.logger.log('Welcome push delivered', { userId });
  }
}
