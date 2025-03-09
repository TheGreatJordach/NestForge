import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { LoggingMiddleware } from '../middlewares/logging.middleware';

@Module({
  providers: [LoggingService],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
