import { Injectable, NestMiddleware } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly Logger: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction): any {
    const startTime: number = Date.now(); // ✅ Capture request start time
    this.Logger.setRequest(req); // ✅ Store request metadata

    res.on('finish', (): void => {
      const duration: number = Date.now() - startTime;
      const statusCode: number = res.statusCode;

      this.Logger.log(
        `HTTP ${req.method} ${req.url} - ${statusCode} (${duration}ms)`,
        {
          method: req.method,
          url: req.url,
          status: statusCode,
          duration: `${duration}ms`,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        },
      );
    });
    next();
  }
}
