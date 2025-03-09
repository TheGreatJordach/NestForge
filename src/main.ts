import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './core/logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until Winston is ready
  });

  const logger = new LoggingService();
  app.useLogger(logger);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
