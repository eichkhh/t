import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { runWithCorrelation } from '../context/correlation-context';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerValue = req.headers['x-correlation-id'];

    const correlationId =
      (Array.isArray(headerValue) ? headerValue[0] : headerValue) ||
      randomUUID();

    res.setHeader('x-correlation-id', correlationId);

    runWithCorrelation(correlationId, () => next());
  }
}
