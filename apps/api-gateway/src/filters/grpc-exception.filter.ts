import { status } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppLogger, ScopedLogger } from '@shared/common';
import type { Response } from 'express';

const GRPC_TO_HTTP: Record<number, HttpStatus> = {
  [status.OK]: HttpStatus.OK,
  [status.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [status.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [status.FAILED_PRECONDITION]: HttpStatus.BAD_REQUEST,
  [status.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [status.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [status.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
  [status.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
};

interface GrpcError {
  code: number;
  message: string;
  details?: string;
}

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger: ScopedLogger;

  constructor(logger: AppLogger) {
    this.logger = logger.withContext(GrpcExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();

      const body = exception.getResponse() as
        | string
        | { message?: string | string[] };

      const message =
        typeof body === 'string' ? body : (body.message ?? exception.message);

      this.logger.warn(
        `HttpException ${httpStatus}: ${JSON.stringify(message)}`,
      );

      response.status(httpStatus).json({ statusCode: httpStatus, message });

      return;
    }

    const grpcError = this.toGrpcError(exception);
    if (grpcError) {
      const httpStatus =
        GRPC_TO_HTTP[grpcError.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const isServerError = httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR;

      if (isServerError) {
        this.logger.error(
          `gRPC error code=${grpcError.code}: ${grpcError.message}`,
        );
      } else {
        this.logger.warn(
          `gRPC error code=${grpcError.code} http=${httpStatus}: ${grpcError.message}`,
        );
      }

      const clientMessage = isServerError
        ? 'Service temporarily unavailable'
        : grpcError.details || grpcError.message;

      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: clientMessage,
      });
      return;
    }

    this.logger.error('Unhandled exception', String(exception));
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private toGrpcError(exception: unknown): GrpcError | null {
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      'message' in exception &&
      typeof (exception as GrpcError).code === 'number'
    ) {
      return exception as GrpcError;
    }

    return null;
  }
}
