import { Injectable, LoggerService } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import * as winston from 'winston';
import { LogstashTcpTransport } from './logstash-tcp.transport';

type Meta = Record<string, unknown>;

type ContextOrMeta = string | Meta | undefined;

export class ScopedLogger {
  constructor(
    private readonly parent: AppLogger,
    private readonly context: string,
  ) {}

  log(message: any, meta?: Meta): void {
    this.parent.log(message, { context: this.context, ...meta });
  }

  warn(message: any, meta?: Meta): void {
    this.parent.warn(message, { context: this.context, ...meta });
  }

  error(message: any, metaOrStack?: string | Meta): void {
    if (typeof metaOrStack === 'string') {
      this.parent.error(message, { context: this.context, stack: metaOrStack });
    } else {
      this.parent.error(message, { context: this.context, ...metaOrStack });
    }
  }

  debug(message: any, meta?: Meta): void {
    this.parent.debug(message, { context: this.context, ...meta });
  }

  verbose(message: any, meta?: Meta): void {
    this.parent.verbose(message, { context: this.context, ...meta });
  }
}

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor(private readonly serviceName: string) {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ];

    const logstashHost = process.env.LOGSTASH_HOST;
    const logstashPort = parseInt(process.env.LOGSTASH_PORT ?? '5044', 10);

    if (logstashHost) {
      transports.push(
        new LogstashTcpTransport({ host: logstashHost, port: logstashPort }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      defaultMeta: { service: serviceName },
      transports,
    });
  }

  withContext(context: string): ScopedLogger {
    return new ScopedLogger(this, context);
  }

  log(message: any, contextOrMeta?: ContextOrMeta): void {
    const [meta, context] = this.split(contextOrMeta);
    this.logger.info(this.toMessage(message), {
      ...this.buildBase(context),
      ...meta,
    });
  }

  warn(message: any, contextOrMeta?: ContextOrMeta): void {
    const [meta, context] = this.split(contextOrMeta);
    this.logger.warn(this.toMessage(message), {
      ...this.buildBase(context),
      ...meta,
    });
  }

  error(message: any, traceOrMeta?: string | Meta, context?: string): void {
    if (typeof traceOrMeta === 'object' && traceOrMeta !== null) {
      this.logger.error(this.toMessage(message), {
        ...this.buildBase(context),
        ...traceOrMeta,
      });
    } else {
      this.logger.error(this.toMessage(message), {
        ...this.buildBase(context),
        stack: traceOrMeta,
      });
    }
  }

  debug(message: any, contextOrMeta?: ContextOrMeta): void {
    const [meta, context] = this.split(contextOrMeta);
    this.logger.debug(this.toMessage(message), {
      ...this.buildBase(context),
      ...meta,
    });
  }

  verbose(message: any, contextOrMeta?: ContextOrMeta): void {
    const [meta, context] = this.split(contextOrMeta);
    this.logger.verbose(this.toMessage(message), {
      ...this.buildBase(context),
      ...meta,
    });
  }

  private split(contextOrMeta: ContextOrMeta): [Meta, string?] {
    if (!contextOrMeta) return [{}, undefined];
    if (typeof contextOrMeta === 'string') return [{}, contextOrMeta];
    return [contextOrMeta, undefined];
  }

  private buildBase(context?: string): Meta {
    const spanContext = trace.getActiveSpan()?.spanContext();

    return {
      ...(spanContext
        ? { traceId: spanContext.traceId, spanId: spanContext.spanId }
        : {}),
      ...(context ? { context } : {}),
    };
  }

  private toMessage(message: unknown): string {
    if (typeof message === 'string') return message;
    return JSON.stringify(message);
  }
}
