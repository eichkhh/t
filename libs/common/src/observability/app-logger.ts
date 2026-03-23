import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { getCorrelationId } from '../context/correlation-context';
import { LogstashTcpTransport } from './logstash-tcp.transport';

type Meta = Record<string, unknown>;

type ContextOrMeta = string | Meta | undefined;

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

  /**
   * NestJS calls: error(message, trace, context)
   * App code can call: error(message, { ...meta })
   */
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
    return {
      correlationId: getCorrelationId() ?? 'n/a',
      ...(context ? { context } : {}),
    };
  }

  private toMessage(message: unknown): string {
    if (typeof message === 'string') return message;
    return JSON.stringify(message);
  }
}
