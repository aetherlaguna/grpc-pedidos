import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, toArray } from 'rxjs';

// ── Interface do stub gRPC gerado a partir do .proto ─────────────
interface InventoryGrpcService {
  checkStock(data: { product_id: string; quantity: number }): Observable<{
    available: boolean;
    current_stock: number;
    product_name: string;
    message: string;
  }>;

  reserveItems(data: { order_id: string; items: { product_id: string; quantity: number }[] }): Observable<{
    success: boolean;
    order_id: string;
    message: string;
  }>;

  listLowStock(data: { threshold: number }): Observable<{
    product_id: string;
    name: string;
    stock: number;
    category: string;
  }>;
}

// ── DTOs ─────────────────────────────────────────────────────────
export interface CreateOrderDto {
  customer_name: string;
  items: { product_id: string; quantity: number }[];
}

@Injectable()
export class OrderService implements OnModuleInit {
  private inventoryService: InventoryGrpcService;

  constructor(@Inject('INVENTORY_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    // Obtém o stub do serviço gRPC ao inicializar o módulo
    this.inventoryService = this.client.getService<InventoryGrpcService>('InventoryService');
  }

  // ── Consulta estoque de um produto ───────────────────────────
  async checkStock(productId: string, quantity: number) {
    const result = await firstValueFrom(
      this.inventoryService.checkStock({ product_id: productId, quantity })
    );
    return result;
  }

  // ── Cria pedido: valida + reserva via gRPC ───────────────────
  async createOrder(dto: CreateOrderDto) {
    const orderId = `ORD-${Date.now()}`;

    console.log(`\n📋 Processando pedido ${orderId} para "${dto.customer_name}"...`);

    // 1. Reserva todos os itens de uma vez (se qualquer um falhar, tudo falha)
    const reservationResult = await firstValueFrom(
      this.inventoryService.reserveItems({
        order_id: orderId,
        items: dto.items,
      })
    );

    if (!reservationResult.success) {
      return {
        success: false,
        order_id: orderId,
        message: reservationResult.message,
      };
    }

    return {
      success: true,
      order_id: orderId,
      customer: dto.customer_name,
      items_count: dto.items.length,
      message: reservationResult.message,
      created_at: new Date().toISOString(),
    };
  }

  // ── Lista produtos com baixo estoque (consome stream gRPC) ────
  async getLowStockProducts(threshold: number) {
    const stream$ = this.inventoryService.listLowStock({ threshold });

    // Coleta todos os itens do stream e retorna como array
    const products = await firstValueFrom(stream$.pipe(toArray()));

    return {
      threshold,
      total: products.length,
      products,
    };
  }
}
