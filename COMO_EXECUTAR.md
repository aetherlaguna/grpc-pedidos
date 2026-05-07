# 🚀 Guia de Execução - gRPC Pedidos

Este projeto demonstra a comunicação entre microsserviços utilizando **gRPC** com **NestJS**. O sistema consiste em um serviço de Pedidos (`Order Service`) que se comunica com um serviço de Estoque (`Inventory Service`).

---

## 🛠️ O que o projeto apresenta?

O projeto foca em três tipos de interação comuns em sistemas distribuídos:

1.  **gRPC Unary (Simples):** Uma requisição para uma resposta. Usado para verificar a disponibilidade de um único produto.
2.  **gRPC Unary (Transacional):** Usado para reservar múltiplos itens de um pedido de uma só vez.
3.  **gRPC Server Streaming:** O servidor envia um fluxo de dados para o cliente. Usado para listar produtos com baixo estoque em tempo real.

---

## 📦 Como subir o projeto

A maneira mais rápida e recomendada é utilizando o **Docker Compose**, pois ele já configura a rede e as variáveis de ambiente necessárias.

### Passo Único:
No diretório raiz do projeto, execute:
```bash
docker compose up --build
```

Isso irá:
- Subir o `inventory-service` na porta **50051** (gRPC).
- Subir o `order-service` na porta **3000** (HTTP REST).
- Mapear os arquivos `.proto` automaticamente.

---

## 🧪 Como Testar

Você tem duas opções principais para testar o sistema:

### Opção 1: Postman (Recomendado)
1. Importe o arquivo `grpc-pedidos.postman_collection.json` (está na raiz do projeto) para o seu Postman.
2. Use as requisições prontas:
   - **Check Stock**: GET para validar estoque.
   - **Create Order**: POST para simular uma compra.
   - **List Low Stock**: GET para ver o streaming em ação.

### Opção 2: Terminal (cURL)

**Verificar Estoque:**
```bash
curl "http://localhost:3000/orders/check-stock/PROD-001?quantity=2"
```

**Criar Pedido:**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Seu Nome",
    "items": [{ "product_id": "PROD-001", "quantity": 1 }]
  }'
```

**Listar Baixo Estoque (Streaming):**
```bash
curl "http://localhost:3000/orders/low-stock?threshold=5"
```

---

## 📂 Estrutura de Comunicação

- **Contrato:** Definido em `proto/inventory.proto`.
- **Fluxo:** Cliente -> `Order Service` (REST) -> `Inventory Service` (gRPC).

---

## 💡 Dicas de Desenvolvimento
- Se alterar o arquivo `.proto`, lembre-se de reiniciar o Docker para que as mudanças sejam aplicadas em ambos os serviços.
- Os dados são armazenados em memória (Mock DB), então reiniciar os containers resetará os estoques para os valores iniciais.
