import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateOrderDto, OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * GET /orders/check-stock/:productId?quantity=2
   *
   * Consulta disponibilidade de um produto.
   * Internamente faz uma chamada gRPC Unary ao Inventory Service.
   */
  @Get('check-stock/:productId')
  async checkStock(
    @Param('productId') productId: string,
    @Query('quantity') quantity: string,
  ) {
    const qty = parseInt(quantity || '1', 10);
    return this.orderService.checkStock(productId, qty);
  }

  /**
   * POST /orders
   * Body: { "customer_name": "João", "items": [{ "product_id": "PROD-001", "quantity": 2 }] }
   *
   * Cria um pedido, validando e reservando estoque via gRPC.
   */
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  /**
   * GET /orders/low-stock?threshold=5
   *
   * Retorna produtos com estoque abaixo do limite.
   * Internamente consome um Server Streaming gRPC do Inventory Service.
   */
  @Get('low-stock')
  async getLowStock(@Query('threshold') threshold: string) {
    const limit = parseInt(threshold || '5', 10);
    return this.orderService.getLowStockProducts(limit);
  }
}
