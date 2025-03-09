import { Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { createLogger, format, transports, Logger } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { CUSTOM_COLORS } from './constants/winston.constant';

winston.addColors(CUSTOM_COLORS);
type WinstonLogInfo = {
  level: string;
  message: string;
  timestamp?: string;
  [key: string]: any;
};

@Injectable({ scope: Scope.DEFAULT })
export class LoggingService {
  private readonly context = 'GlobalLogger';
  private requestMetadata: Record<string, unknown> = {}; // ✅ Declare requestMetadata
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // ✅ Keep proper timestamps
        format.errors({ stack: true }),
        format.json(),
      ),

      transports: [
        // ✅ Console Logs (for debugging)
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }), // ✅ Apply colors to entire log
            format.printf(this.formatLog),
          ),
        }),
        // ✅ File Logs (Daily Rotation)
        new winston.transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d', // Keep logs for 30 days
        }),
        // ✅ Elasticsearch Transport (for ELK Stack)
        new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: process.env['ELASTICSEARCH_URL'] || 'http:localhost:9200',
          },
        }),
      ],
    });
  }

  formatLog(info: WinstonLogInfo): string {
    return `${info.timestamp} [${info.level}] ${info.message} ${JSON.stringify(info)}`;
  }

  private print(
    level: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    const entry = {
      timestamp: new Date().toDateString(),
      level,
      context: this.context,
      message,
      ...this.requestMetadata,
      ...metadata,
    };
    this.logger.log(level, message, entry); // Use Winston/Pino here in prod
  }

  // Optional: Track request context
  setRequest(request: Request) {
    this.requestMetadata = {
      requestId: request.headers['x-request-id'] || this.generateRequestId(),
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      methode: request.method,
      url: request.originalUrl,
    };
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  log(message: string, ...optionalParams: any[]) {
    const metadata = optionalParams[0] || {};
    this.print('info', message, { metadata });
  }

  error(message: string, ...optionalParams: any[]) {
    const error =
      optionalParams[0] instanceof Error ? optionalParams[0] : undefined;
    const metadata = optionalParams.length > 1 ? optionalParams[1] : {};
    this.print('error', message, { ...metadata, error: error?.stack });
  }

  warn(message: string, ...optionalParams: any[]) {
    const metadata = optionalParams[0] || {};
    this.print('warn', message, metadata);
  }

  debug?(message: string, ...optionalParams: any[]) {
    const metadata = optionalParams[0] || {};
    this.print('debug', message, metadata);
  }

  verbose?(message: string, ...optionalParams: any[]) {
    const metadata = optionalParams[0] || {};
    this.print('verbose', message, metadata);
  }
}
