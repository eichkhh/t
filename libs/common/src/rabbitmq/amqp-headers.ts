import { randomUUID } from 'node:crypto';
import {
  getCorrelationId,
  runWithCorrelation,
} from '../context/correlation-context';

const CORRELATION_HEADER = 'x-correlation-id';

function correlationIdFromHeaders(
  headers: Record<string, unknown> | undefined,
): string | undefined {
  if (!headers) return undefined;

  const val = headers[CORRELATION_HEADER];

  if (typeof val === 'string' && val.length > 0) return val;

  if (Buffer.isBuffer(val)) {
    const s = val.toString('utf8');
    return s.length > 0 ? s : undefined;
  }

  return undefined;
}

export function amqpCorrelationHeaders(
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...extra, [CORRELATION_HEADER]: getCorrelationId() ?? randomUUID() };
}

export function runWithAmqpCorrelation<T>(
  headers: Record<string, unknown> | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  const correlationId = correlationIdFromHeaders(headers) ?? randomUUID();

  return runWithCorrelation(correlationId, fn);
}
