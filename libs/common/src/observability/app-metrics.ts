import { Injectable } from '@nestjs/common';
import { type Counter, metrics } from '@opentelemetry/api';

@Injectable()
export class AppMetrics {
  readonly registrationsTotal: Counter;
  readonly welcomePushTotal: Counter;
  readonly outboxRelayTotal: Counter;
  readonly outboxRecoveredTotal: Counter;

  constructor() {
    const meter = metrics.getMeter('test');

    this.registrationsTotal = meter.createCounter('registrations_total', {
      description: 'Total number of user registrations',
    });

    this.welcomePushTotal = meter.createCounter('welcome_push_total', {
      description: 'Total welcome push delivery attempts',
    });

    this.outboxRelayTotal = meter.createCounter('outbox_relay_total', {
      description: 'Total outbox relay publish attempts',
    });

    this.outboxRecoveredTotal = meter.createCounter('outbox_recovered_total', {
      description: 'Total stuck outbox rows recovered',
    });
  }
}
