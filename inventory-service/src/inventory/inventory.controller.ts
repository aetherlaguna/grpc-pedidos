import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Unary RPC
  @GrpcMethod('InventoryService', 'CheckStock')
  checkStock(data: { product_id: string; quantity: number }) {
    console.log(`\n[gRPC] CheckStock chamado → produto: ${data.product_id}, qtd: ${data.quantity}`);
    return this.inventoryService.checkStock(data);
  }

  // Unary RPC
  @GrpcMethod('InventoryService', 'ReserveItems')
  reserveItems(data: { order_id: string; items: { product_id: string; quantity: number }[] }) {
    console.log(`\n[gRPC] ReserveItems chamado → pedido: ${data.order_id}, itens: ${data.items.length}`);
    return this.inventoryService.reserveItems(data);
  }

  // Server Streaming RPC
  @GrpcMethod('InventoryService', 'ListLowStock')
  listLowStock(data: { threshold: number }): Observable<any> {
    console.log(`\n[gRPC] ListLowStock (stream) chamado → limite: ${data.threshold}`);
    return this.inventoryService.listLowStock(data);
  }
}
