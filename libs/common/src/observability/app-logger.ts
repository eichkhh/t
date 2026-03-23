import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { getCorrelationId } from '../context/correlation-context';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor(serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  log(message: string) {
    this.logger.log(this.format(message));
  }

  warn(message: string) {
    this.logger.warn(this.format(message));
  }

  error(message: string, stack?: string) {
    this.logger.error(this.format(message), stack);
  }

  debug(message: string) {
    this.logger.debug(this.format(message));
  }

  verbose(message: string) {
    this.logger.verbose(this.format(message));
  }

  private format(message: string): string {
    return `[correlationId=${getCorrelationId() ?? 'n/a'}] ${message}`;
  }
}
