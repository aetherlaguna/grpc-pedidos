import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'inventory',
          protoPath: join(__dirname, '../../../proto/inventory.proto'),
          url: process.env.INVENTORY_SERVICE_URL || 'localhost:50051',
          loader: {
            keepCase: true,
          },
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
