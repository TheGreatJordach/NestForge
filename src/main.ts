import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './core/logging/logging.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true, // Buffer logs until Winston is ready
    });

    const logger = new LoggingService();
    app.useLogger(logger);

    const configService = app.get(ConfigService);
    const port: number = configService.getOrThrow<number>('APP_PORT') ?? 3000;

    await app.listen(port);
    logger.log(`🚀 App is running on port ${port}`);
  } catch (error) {
    console.error('🛑 Logging system failed!', error);
    process.exit(1); // ✅ Stops app to avoid a broken state
  }
}
bootstrap();
