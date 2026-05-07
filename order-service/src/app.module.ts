import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    // Registra o cliente gRPC que vai se conectar ao Inventory Service
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'inventory',
          protoPath: join(__dirname, '../../proto/inventory.proto'),
          url: 'localhost:50051',
        },
      },
    ]),
    OrderModule,
  ],
})
export class AppModule {}
