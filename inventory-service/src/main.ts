import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'inventory',
        protoPath: join(__dirname, '../../proto/inventory.proto'),
        url: '0.0.0.0:50051',
        loader: {
          keepCase: true,
        },
      },
    },
  );

  await app.listen();
  console.log('🚀 Inventory Service (gRPC) rodando na porta 50051');
}

bootstrap();
