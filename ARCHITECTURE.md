# Multi-Tenant Inventory Management System – Architecture

This document explains the architectural decisions taken while building the system, including trade-offs, reasoning, and scalability considerations.

The goal of this design was to balance:

- Simplicity
- Data integrity
- Performance
- Real-world inventory correctness
- Scalability readiness

---

# 1. Multi-Tenancy Strategy

## Shared Database with Row-Level Isolation

Each document across all collections includes a `tenantId` field.

Example:

{
  _id,
  tenantId,
  ...
}

### Why This Approach Was Chosen

A shared database with row-level isolation was selected because:

- It minimizes operational complexity
- It avoids provisioning separate databases per tenant
- It allows efficient use of resources
- It works naturally with MongoDB compound indexing
- It simplifies deployment and scaling

This approach is well-suited for SaaS systems with many small-to-medium tenants.

---

### Pros

- Simple to implement
- Efficient memory and connection usage
- Lower operational cost
- Easier horizontal scaling
- Index-friendly
- No database-per-tenant overhead

---

### Cons

- Logical isolation (not physical isolation)
- Requires strict query discipline
- All queries must enforce `tenantId`

---

### Enforcement Strategy

- All queries explicitly filter by `tenantId`
- All indexes include `tenantId`
- Tenant context must be derived from authenticated user (in production)

Example:

Variant.find({ tenantId: req.user.tenantId })

This ensures data isolation at the application layer.

---

# 2. Data Modeling Decisions

## Product & Variant Separation

Products and variants are modeled separately.

Product → conceptual item  
Variant → SKU-level stock unit

Example:

T-Shirt  
  ├── Size M, Red  
  ├── Size L, Red  
  ├── Size M, Blue  

Each variant tracks:

- stock
- price
- reorderLevel

---

## Why Variants Are Not Embedded Inside Product

Embedding variants inside Product documents was avoided because:

- Atomic stock updates would become complex
- Document size would grow quickly
- Indexing nested variants is less efficient
- High write contention if multiple variants update simultaneously

Instead, a separate `Variant` collection allows:

- Atomic stock updates
- Independent indexing
- Better concurrency handling
- Scalable SKU management

This aligns with high-write inventory systems.

---

# 3. Concurrency & Data Integrity

## Problem

Two users attempt to purchase the last item simultaneously.

Without protection:
- Stock could go negative
- Data integrity could be compromised

---

## Solution: Atomic Conditional Update

Stock deduction uses:

await Variant.updateOne(
  {
    _id: variantId,
    tenantId,
    stock: { $gte: quantity }
  },
  {
    $inc: { stock: -quantity }
  }
);

---

## Why This Works

MongoDB guarantees document-level atomicity.

- The `$gte` condition ensures stock is sufficient.
- `$inc` executes atomically.
- Only one request succeeds when stock is low.

This prevents race conditions without using full transactions.

---

## Why Transactions Were Not Used

MongoDB multi-document transactions require a replica set.

For simplicity and local development:

- Atomic single-document updates were used.
- This covers the most critical integrity requirement (stock cannot go negative).

In production:

- System should run on a replica set.
- Multi-document transactions can wrap order + stock movement updates.

The design leaves room for upgrade without refactoring the core logic.

---

# 4. Stock Movement Tracking

All stock changes are recorded in `StockMovement`.

Types:

- SALE
- PURCHASE
- RETURN
- ADJUSTMENT

---

## Why Track Stock Movements Separately?

Benefits:

- Full audit trail
- Analytics-ready design
- No hidden stock mutations
- Easier debugging
- Enables dashboard aggregation

Stock value is never silently changed.

Every change has traceability.

This mirrors real ERP systems.

---

# 5. Purchase Order Lifecycle

States:

DRAFT → SENT → CONFIRMED → RECEIVED

---

## Why State-Based Lifecycle?

- Reflects real procurement workflow
- Prevents premature stock increments
- Enables partial deliveries

---

## Partial Delivery Handling

Each PO item tracks:

- orderedQty
- receivedQty

Stock is incremented only when items are received.

Status changes to RECEIVED only when:

receivedQty === orderedQty (for all items)

---

## Why This Matters

Real-world suppliers often:

- Deliver partially
- Delay shipments
- Send incorrect quantities

The system models these realities instead of assuming ideal conditions.

---

# 6. Smart Low-Stock Alerts

Low-stock logic considers incoming purchase orders.

Formula:

effectiveStock = currentStock + pendingIncomingQty

Where:

pendingIncomingQty = orderedQty - receivedQty  
(for POs not in RECEIVED state)

Alert triggered if:

effectiveStock <= reorderLevel

---

## Why This Logic Was Implemented

Naive systems trigger alerts based only on current stock.

That causes false alerts when replenishment is already in progress.

This approach:

- Prevents unnecessary procurement
- Reflects real supply-chain logic
- Improves decision accuracy

---

# 7. Dashboard & Analytics

## Inventory Value

Sum(stock × price)

---

## Top 5 Sellers (Last 30 Days)

Aggregation pipeline:

- Filter type = SALE
- Filter by date range
- Group by variantId
- Sort descending
- Limit 5

---

## Stock Movement Graph (7 Days)

Grouped by:

- Date
- Movement type

---

## Why Use Aggregation Pipelines?

- Offloads computation to MongoDB
- Reduces application-layer processing
- Avoids transferring unnecessary data
- Scales better than JS loops

---

# 8. Performance Optimization

Designed to support 10,000+ products per tenant.

---

## Indexing Strategy

Indexes added on:

- tenantId (all collections)
- { tenantId, productId }
- { tenantId, createdAt }
- { tenantId, type, createdAt } (StockMovement)

---

## Why Compound Indexes?

Because:

- tenantId is always filtered
- Most queries are tenant-scoped
- Date-based filtering is common
- Aggregations depend on filtering first

This prevents full collection scans.

---

## Dashboard Performance (< 2 Seconds)

Achieved by:

- Proper indexing
- Filtering by tenantId
- Filtering by date ranges
- Using aggregation pipelines
- Using projections
- Avoiding unnecessary document hydration
- Avoiding heavy JS computation

---

# 9. Scalability Considerations

## Current Design

- Single MongoDB instance
- Row-level tenant isolation
- Atomic operations

---

## Future Improvements

- Deploy MongoDB replica set (for transactions)
- Enable sharding by tenantId
- Introduce Redis caching for dashboard endpoints
- Add background job queue for heavy aggregations
- Implement event-driven stock processing
- Add monitoring and observability

The architecture allows incremental scaling without major redesign.

---

# 10. Security Considerations (Future)

- JWT-based authentication
- Role-based access control
- Request-level tenant validation
- Input validation (Zod or similar)
- Rate limiting
- Audit logging

---

# Final Architecture Summary

This system prioritizes:

- Data integrity
- Atomic stock updates
- Clear tenant isolation
- Auditability
- Real-world inventory correctness
- Performance-conscious indexing
- Scalable design
- Clean TypeScript typing

The design balances simplicity and correctness while leaving room for production-grade scaling.