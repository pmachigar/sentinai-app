import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // rawBody es requerido por Stripe para validar la firma de Webhooks
  const app = await NestFactory.create(AppModule, { rawBody: true }); 
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  
  await app.listen(3000);
  console.log(`🚀 Core API running on: ${await app.getUrl()}`);
}
bootstrap();
