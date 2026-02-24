# Multi-Tenant Inventory Management System

A full-stack SaaS platform where multiple businesses (tenants) independently manage:

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

### Backend
- Node.js + Express
- MongoDB + Mongoose
- TypeScript
- Swagger (OpenAPI Documentation)

### Frontend
- React (Vite)
- TypeScript
- Axios
- Recharts (Data Visualization)

### Architecture
Row-level multi-tenancy using `tenantId`.

---

## Architecture Overview

### Multi-Tenant Strategy

Shared database with row-level isolation using `tenantId`.

This ensures:

- Logical isolation
- Simpler deployment
- Lower operational overhead
- Efficient indexing

See `ARCHITECTURE.md` for detailed explanation and trade-offs.

---

## Core Features

### 1. Product & Variant Management

- Products modeled separately from variants
- Each variant represents a unique SKU
- Stock tracked at variant level
- Reorder level supported

---

### 2. Concurrency-Safe Order Processing

- Atomic stock deduction using `$inc` + `$gte`
- Prevents negative stock
- Race-condition safe
- Logs all stock movements
- Order cancellation restores stock correctly

---

### 3. Purchase Order Lifecycle

Supports:

DRAFT → SENT → CONFIRMED → RECEIVED

Features:

- Multiple items per PO
- Partial delivery support
- Over-receive prevention
- Automatic stock increment on receipt
- Smart stock reconciliation

---

### 4. Smart Low-Stock Alerts

Low-stock logic considers incoming Purchase Orders.

effectiveStock = currentStock + pendingIncomingQty

Alert triggered only if:

effectiveStock <= reorderLevel

Prevents false alerts when replenishment is already in progress.

---

### 5. Dashboard & Analytics

Backend provides:

- Inventory Value
- Top 5 Sellers (Last 30 Days)
- Stock Movement Graph (Last 7 Days)
- Smart Low Stock Items

Frontend displays:

- Clean dashboard UI
- Real-time API integration
- Data visualization using charts

---

## Performance Considerations

Designed to support **10,000+ products**.

Optimizations include:

- Compound indexes on `tenantId`
- Indexed date-based filtering
- Aggregation pipelines
- Projection to reduce payload size
- Efficient dashboard queries

Dashboard endpoints designed to load in **< 2 seconds** under expected scale.

---

## API Documentation

Swagger UI available at:

http://localhost:5000/api/docs

Includes:

- All endpoints
- Request/response schemas
- Interactive testing

---

## Setup Instructions

### 1️⃣ Clone Repository

git clone https://github.com/NaiveDemon/multi-tenant-inventory-system  
cd multi-tenant-inventory-system  

---

## Backend Setup

npm install  

MongoDB must be running on:

mongodb://127.0.0.1:27017

### Create Environment File

Create a `.env` file in the root directory, copy .env.example file and paste in it

Start backend:

npm run dev  

Server runs at:

http://localhost:5000  

---

## Seed Sample Data

npm run seed  

Creates:

- 2 tenants
- Sample variants
- Sample inventory data

---

## Frontend Setup

Navigate to client folder:

cd client  
npm install  
npm run dev  

Frontend runs at:

http://localhost:5173  

Make sure backend is running before starting frontend.

---

## Roles (Planned for future)

- OWNER  
- MANAGER  
- STAFF  

Role-based enforcement can be implemented via middleware.

---

## Assumptions

- Single MongoDB instance (no replica set)
- Atomic operations used instead of distributed transactions
- Authentication layer simplified
- Local development environment

---

## Future Improvements

- MongoDB Replica Set for multi-document transactions
- Redis caching for dashboard queries
- Sharding by `tenantId`
- JWT authentication middleware
- Background job processing (queues)
- Cloud deployment (Render / AWS / Vercel)
- CI/CD pipeline
