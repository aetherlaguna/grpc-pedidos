import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

// ── Tipos do proto ────────────────────────────────────────────────
interface CheckStockRequest  { product_id: string; quantity: number }
interface CheckStockResponse { available: boolean; current_stock: number; product_name: string; message: string }
interface OrderItem          { product_id: string; quantity: number }
interface ReserveItemsRequest  { order_id: string; items: OrderItem[] }
interface ReserveItemsResponse { success: boolean; order_id: string; message: string }
interface ListLowStockRequest  { threshold: number }
interface ProductStock { product_id: string; name: string; stock: number; category: string }

// ── Banco de dados em memória (mock) ─────────────────────────────
interface Product {
  id: string;
  name: string;
  stock: number;
  category: string;
}

@Injectable()
export class InventoryService {
  private products: Map<string, Product> = new Map([
    ['PROD-001', { id: 'PROD-001', name: 'Notebook Dell XPS 15',    stock: 12, category: 'Eletrônicos' }],
    ['PROD-002', { id: 'PROD-002', name: 'Mouse Logitech MX Master', stock: 3,  category: 'Periféricos' }],
    ['PROD-003', { id: 'PROD-003', name: 'Teclado Mecânico Keychron', stock: 0, category: 'Periféricos' }],
    ['PROD-004', { id: 'PROD-004', name: 'Monitor LG UltraWide',     stock: 7,  category: 'Monitores'  }],
    ['PROD-005', { id: 'PROD-005', name: 'SSD Samsung 1TB',          stock: 2,  category: 'Armazenamento' }],
    ['PROD-006', { id: 'PROD-006', name: 'Webcam Logitech C920',     stock: 15, category: 'Periféricos' }],
  ]);

  // ── Unary: CheckStock ───────────────────────────────────────────
  checkStock(data: CheckStockRequest): CheckStockResponse {
    const product = this.products.get(data.product_id);

    if (!product) {
      return {
        available:     false,
        current_stock: 0,
        product_name:  'Desconhecido',
        message:       `Produto ${data.product_id} não encontrado no catálogo`,
      };
    }

    const available = product.stock >= data.quantity;

    return {
      available,
      current_stock: product.stock,
      product_name:  product.name,
      message: available
        ? `✅ Estoque disponível: ${product.stock} unidades`
        : `❌ Estoque insuficiente: solicitado ${data.quantity}, disponível ${product.stock}`,
    };
  }

  // ── Unary: ReserveItems ─────────────────────────────────────────
  reserveItems(data: ReserveItemsRequest): ReserveItemsResponse {
    // Valida todos os itens antes de reservar qualquer coisa
    for (const item of data.items) {
      const product = this.products.get(item.product_id);

      if (!product) {
        return {
          success:  false,
          order_id: data.order_id,
          message:  `Produto ${item.product_id} não encontrado`,
        };
      }

      if (product.stock < item.quantity) {
        return {
          success:  false,
          order_id: data.order_id,
          message:  `Estoque insuficiente para "${product.name}": solicitado ${item.quantity}, disponível ${product.stock}`,
        };
      }
    }

    // Reserva (desconta estoque)
    for (const item of data.items) {
      const product = this.products.get(item.product_id)!;
      product.stock -= item.quantity;
      console.log(`📦 Reservado: ${item.quantity}x ${product.name} (restante: ${product.stock})`);
    }

    return {
      success:  true,
      order_id: data.order_id,
      message:  `Pedido ${data.order_id} confirmado! ${data.items.length} produto(s) reservado(s).`,
    };
  }

  // ── Server Streaming: ListLowStock ──────────────────────────────
  listLowStock(data: ListLowStockRequest): Observable<ProductStock> {
    const subject = new Subject<ProductStock>();

    // Simula envio assíncrono item por item (comportamento de stream)
    const lowStockProducts = [...this.products.values()]
      .filter(p => p.stock <= data.threshold)
      .sort((a, b) => a.stock - b.stock);

    let index = 0;

    const interval = setInterval(() => {
      if (index >= lowStockProducts.length) {
        clearInterval(interval);
        subject.complete();
        return;
      }

      const p = lowStockProducts[index++];
      console.log(`📡 Streaming produto com baixo estoque: ${p.name} (${p.stock})`);
      subject.next({ product_id: p.id, name: p.name, stock: p.stock, category: p.category });
    }, 300); // envia um produto a cada 300ms pra demonstrar o stream

    return subject.asObservable();
  }
}
