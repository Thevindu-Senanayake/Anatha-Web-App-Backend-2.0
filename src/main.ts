import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use ConfigService to access environment variables
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe()); // Register ValidationPipe globally
  app.use(cookieParser());
  const port = configService.get<number>('port') || 3000;

  await app.listen(port);
}
bootstrap();
