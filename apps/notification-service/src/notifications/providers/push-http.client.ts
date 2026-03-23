import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { firstValueFrom, timeout } from 'rxjs';
import { NotificationServiceConfigService } from '../../config/notification-service-config.service';

export class PushHttpError extends Error {
  constructor(
    readonly reason: string,
    readonly cause: unknown,
  ) {
    super(`Push HTTP request failed: ${reason}`);
    this.name = 'PushHttpError';
  }
}

@Injectable()
export class PushHttpClient {
  private readonly webhookUrl: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly http: HttpService,
    config: NotificationServiceConfigService,
  ) {
    this.webhookUrl = config.pushWebhookUrl;
    this.timeoutMs = config.pushTimeoutMs;
  }

  async post(payload: Record<string, unknown>): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(this.webhookUrl, payload).pipe(timeout(this.timeoutMs)),
      );
    } catch (err) {
      throw new PushHttpError(resolveReason(err), err);
    }
  }
}

function resolveReason(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.code === 'ECONNABORTED' || err.name === 'TimeoutError')
      return 'timeout';
    if (err.response) return `http_${err.response.status}`;
    if (err.code) return err.code;
  }
  return 'unknown';
}
