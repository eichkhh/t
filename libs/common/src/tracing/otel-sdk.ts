import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';

export function startOtelSdk(serviceName: string): void {
  const metricsPort = parseInt(process.env.METRICS_PORT ?? '9464', 10);
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({ 'service.name': serviceName }),
    ...(otlpEndpoint
      ? {
          traceExporter: new OTLPTraceExporter({
            url: `${otlpEndpoint}/v1/traces`,
          }),
        }
      : {}),
    metricReader: new PrometheusExporter({ port: metricsPort }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();
}
