import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('🛒 Order Service (HTTP) rodando em http://localhost:3000');
  console.log('\nEndpoints disponíveis:');
  console.log('  GET  /orders/check-stock/:productId?quantity=N');
  console.log('  POST /orders');
  console.log('  GET  /orders/low-stock?threshold=N');
}

bootstrap();
