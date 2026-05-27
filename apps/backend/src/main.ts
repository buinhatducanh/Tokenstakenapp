import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allow Vite to connect
  app.setGlobalPrefix('api');
  await app.listen(3000, '127.0.0.1');
  console.log('NestJS Backend is running on http://127.0.0.1:3000/api');
}
bootstrap();
