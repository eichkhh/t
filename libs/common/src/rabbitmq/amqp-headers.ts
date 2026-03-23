import { randomUUID } from 'node:crypto';
import { getCorrelationId } from '../context/correlation-context';

const CORRELATION_HEADER = 'x-correlation-id';

export function amqpCorrelationHeaders(
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...extra, [CORRELATION_HEADER]: getCorrelationId() ?? randomUUID() };
}
