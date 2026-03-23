import {
  SpanKind,
  SpanStatusCode,
  context,
  propagation,
  trace,
} from '@opentelemetry/api';

export type OtelCarrier = Record<string, string>;

export function injectOtelContext(): OtelCarrier {
  const carrier: OtelCarrier = {};
  propagation.inject(context.active(), carrier);
  return carrier;
}

export async function runWithOtelContext<T>(
  carrier: OtelCarrier,
  spanName: string,
  tracerName: string,
  fn: () => Promise<T>,
): Promise<T> {
  const parentCtx = propagation.extract(context.active(), carrier);
  const span = trace
    .getTracer(tracerName)
    .startSpan(spanName, { kind: SpanKind.INTERNAL }, parentCtx);

  return context.with(trace.setSpan(parentCtx, span), async () => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(err as Error);

      throw err;
    } finally {
      span.end();
    }
  });
}
