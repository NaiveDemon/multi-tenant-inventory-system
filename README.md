# Multi-Tenant Inventory Management System

A SaaS backend platform where multiple businesses (tenants) independently manage:

- Inventory
- Product variants (SKUs)
- Suppliers
- Purchase Orders
- Sales Orders
- Stock Movements
- Dashboard analytics

Designed to handle real-world inventory complexities including concurrent operations, partial deliveries, and smart low-stock alerts.

---

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Language:** TypeScript
- **Architecture:** Row-level multi-tenancy

---

## Architecture Overview

### Multi-Tenant Strategy
Shared database with row-level isolation using `tenantId`.


This ensures:
- Logical isolation
- Simpler deployment
- Better scalability
- Efficient indexing

See `ARCHITECTURE.md` for detailed explanation.

---

## Core Features

### 1. Product & Variant Management
- Products modeled separately from variants
- Each variant represents a unique SKU
- Stock tracked at variant level

---

### 2. Concurrency-Safe Order Processing
- Atomic stock deduction using `$inc` + `$gte`
- Prevents negative stock
- Race-condition safe
- Logs all stock movements

---

### 3. Purchase Order Lifecycle
Supports:

DRAFT → SENT → CONFIRMED → RECEIVED


Features:
- Multiple items per PO
- Partial delivery support
- Over-receive prevention
- Automatic stock increment on receipt

---

### 4. Smart Low-Stock Alerts

Low-stock logic considers incoming Purchase Orders.

effectiveStock = currentStock + pendingIncomingQty

Alert triggered only if:

effective stock <= reorder level

Prevents false alerts when stock is already replenishing.

---

### 5. Dashboard & Analytics

Includes:

- Inventory Value
- Top 5 Sellers (Last 30 Days)
- Stock Movement Graph (Last 7 Days)
- Smart Low Stock Items

All queries optimized using proper indexing.

---

## Performance Considerations

Designed to support **10,000+ products**.

Optimizations include:

- Compound indexes on `tenantId`
- Indexed date-based filtering
- Aggregation pipelines instead of JS loops
- Projection to reduce payload size

Dashboard endpoints designed to load in **< 2 seconds** under expected scale.

---

## Setup Instructions

### Clone Repository

```bash
git clone <your-repo-url>
cd multi-tenant-inventory
npm install
```
MongoDB must be running on 
`mongodb://127.0.0.1:27017`

```bash
npm run dev
```

Server runs on `http://localhost:5000`

To populate sample tenants and variants:
```bash
npm run seed
```

Creates:

- 2 tenants
- Sample variants for each tenant

---

## Roles (Planned)

- OWNER  
- MANAGER  
- STAFF  

Role-based enforcement can be added via middleware.

---

## Assumptions

- Single MongoDB instance (no replica set)
- Atomic operations used instead of full transactions
- Authentication layer simplified
- Frontend not included


---

## Future Improvements

- MongoDB Replica Set for transactions
- Redis caching for dashboard
- Sharding by `tenantId`
- JWT authentication middleware
- Background job processing
- Deployment on cloud (Render / Vercel / AWS)


