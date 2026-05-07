# 📦 gRPC Pedidos — Sistema de Pedidos com Validação de Estoque

Projeto acadêmico demonstrando comunicação entre microsserviços usando **gRPC**.  
Desenvolvido com **NestJS + TypeScript**.

---

## 🏗️ Arquitetura

```
┌────────────────────────────────────────────────────────┐
│                      CLIENTE (curl/Insomnia)            │
│                       HTTP REST                        │
└───────────────────────┬────────────────────────────────┘
                        │ HTTP :3000
                        ▼
┌───────────────────────────────────────┐
│          ORDER SERVICE                │
│  (NestJS HTTP + gRPC Client)          │
│                                       │
│  GET /orders/check-stock/:id          │
│  POST /orders                         │
│  GET /orders/low-stock                │
└───────────────────────┬───────────────┘
                        │ gRPC :50051
                        │ (Protocol Buffers)
                        ▼
┌───────────────────────────────────────┐
│        INVENTORY SERVICE              │
│  (NestJS gRPC Server)                 │
│                                       │
│  CheckStock    → Unary RPC            │
│  ReserveItems  → Unary RPC            │
│  ListLowStock  → Server Streaming     │
└───────────────────────────────────────┘
```

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- npm

### Terminal 1 — Inventory Service (gRPC)
```bash
cd inventory-service
npm install
npm run start
# 🚀 Inventory Service (gRPC) rodando na porta 50051
```

### Terminal 2 — Order Service (HTTP + gRPC Client)
```bash
cd order-service
npm install
npm run start
# 🛒 Order Service (HTTP) rodando em http://localhost:3000
```

### Alternativa: Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Testando os Endpoints

### 1. Verificar Estoque (Unary RPC)
```bash
# Produto disponível
curl "http://localhost:3000/orders/check-stock/PROD-001?quantity=2"

# Estoque insuficiente
curl "http://localhost:3000/orders/check-stock/PROD-002?quantity=99"

# Produto não existe
curl "http://localhost:3000/orders/check-stock/PROD-999?quantity=1"
```

**Resposta de sucesso:**
```json
{
  "available": true,
  "current_stock": 12,
  "product_name": "Notebook Dell XPS 15",
  "message": "✅ Estoque disponível: 12 unidades"
}
```

---

### 2. Criar Pedido — valida + reserva estoque (Unary RPC)
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "João Silva",
    "items": [
      { "product_id": "PROD-001", "quantity": 1 },
      { "product_id": "PROD-004", "quantity": 2 }
    ]
  }'
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "order_id": "ORD-1714000000000",
  "customer": "João Silva",
  "items_count": 2,
  "message": "Pedido ORD-1714000000000 confirmado! 2 produto(s) reservado(s).",
  "created_at": "2024-04-25T12:00:00.000Z"
}
```

**Resposta com falha (estoque insuficiente):**
```json
{
  "success": false,
  "order_id": "ORD-1714000000001",
  "message": "Estoque insuficiente para \"Mouse Logitech MX Master\": solicitado 10, disponível 3"
}
```

---

### 3. Listar Produtos com Baixo Estoque (Server Streaming RPC)
```bash
curl "http://localhost:3000/orders/low-stock?threshold=5"
```

**Resposta:**
```json
{
  "threshold": 5,
  "total": 3,
  "products": [
    { "product_id": "PROD-003", "name": "Teclado Mecânico Keychron", "stock": 0, "category": "Periféricos" },
    { "product_id": "PROD-002", "name": "Mouse Logitech MX Master",  "stock": 3, "category": "Periféricos" },
    { "product_id": "PROD-005", "name": "SSD Samsung 1TB",           "stock": 2, "category": "Armazenamento" }
  ]
}
```

---

## 📁 Estrutura do Projeto

```
grpc-pedidos/
├── proto/
│   └── inventory.proto          ← Contrato compartilhado (único source of truth)
│
├── inventory-service/           ← Servidor gRPC
│   └── src/
│       ├── main.ts              ← Bootstrap gRPC na porta 50051
│       └── inventory/
│           ├── inventory.controller.ts  ← @GrpcMethod handlers
│           └── inventory.service.ts     ← Lógica de negócio + mock DB
│
├── order-service/               ← Cliente gRPC + REST API
│   └── src/
│       ├── main.ts              ← Bootstrap HTTP na porta 3000
│       └── order/
│           ├── order.controller.ts  ← Endpoints REST
│           └── order.service.ts     ← Chama o gRPC client
│
└── docker-compose.yml
```

---

## 🔍 Tipos de RPC Demonstrados

| Método | Tipo | Descrição |
|--------|------|-----------|
| `CheckStock` | **Unary** | 1 request → 1 response |
| `ReserveItems` | **Unary** | 1 request → 1 response (transacional) |
| `ListLowStock` | **Server Streaming** | 1 request → múltiplas responses em stream |

---

## 💡 Por que gRPC?

| | REST/JSON | gRPC/Protobuf |
|---|---|---|
| **Contrato** | Implícito (OpenAPI opcional) | Explícito e obrigatório (.proto) |
| **Serialização** | JSON (texto) | Protobuf (binário ~3-10x menor) |
| **Performance** | Boa | Muito melhor (HTTP/2, binary) |
| **Streaming** | Complexo (SSE/WebSocket) | Nativo (4 tipos) |
| **Tipagem** | Opcional | Gerada automaticamente |
| **Ideal para** | APIs públicas | Comunicação interna entre serviços |

---

## 🛒 Produtos disponíveis para teste

| ID | Nome | Estoque |
|----|------|---------|
| PROD-001 | Notebook Dell XPS 15 | 12 |
| PROD-002 | Mouse Logitech MX Master | 3 |
| PROD-003 | Teclado Mecânico Keychron | 0 |
| PROD-004 | Monitor LG UltraWide | 7 |
| PROD-005 | SSD Samsung 1TB | 2 |
| PROD-006 | Webcam Logitech C920 | 15 |
