import { Injectable } from '@nestjs/common';
import { AppLogger } from '@shared/common';
import type { IPushService } from '../interfaces/push.interface';
import { PushHttpClient } from './push-http.client';

@Injectable()
export class WebhookPushService implements IPushService {
  constructor(
    private readonly client: PushHttpClient,
    private readonly logger: AppLogger,
  ) {}

  async sendWelcome(userId: string, name: string): Promise<void> {
    this.logger.log(`Sending welcome push userId=${userId}`);

    await this.client.post({
      event: 'welcome_push',
      userId,
      name,
      sentAt: new Date().toISOString(),
    });

    this.logger.log(`Welcome push delivered userId=${userId}`);
  }
}
