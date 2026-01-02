import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    credentials: true,
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });
  await app.listen(process.env.PORT ?? 9000);

  // log
  console.log('Applications is running on: http://localhost:9000/api/v1');
}

bootstrap();
