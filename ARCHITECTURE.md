Multi-Tenant Inventory Management System – Architecture

1. Multi-Tenancy Strategy
Shared Database with Row-Level Isolation

Each document across collections includes a tenantId field.

Example:

{
  _id,
  tenantId,
  ...
}

Pros of this approach:

Simple to implement

Efficient resource utilization

Easy to scale horizontally

Works well with MongoDB indexing

Lower operational complexity compared to separate DB per tenant

Cons:

Logical isolation (not physical)

Requires strict enforcement of tenantId filtering in queries


All queries include tenantId

All indexes include tenantId

Tenant context must be derived from authenticated user (in production)

Example:

Variant.find({ tenantId: req.user.tenantId })

2. Data Modeling Decisions
Product & Variant Modeling

Products and variants are separated:

Product → conceptual item

Variant → SKU-level stock unit

Example:

T-Shirt
  ├── Size M, Red
  ├── Size L, Red
  ├── Size M, Blue

Each variant tracks:

stock

price

reorderLevel

Why Not Embed Variants Inside Product?

Embedding variants would:

Make atomic stock updates difficult

Increase document size

Complicate indexing

Increase write contention

Separate Variant collection allows:

Atomic stock updates

Efficient indexing

Scalable SKU management

3. Concurrency & Data Integrity
Problem

Two users attempt to purchase the last item simultaneously.

Solution

Atomic conditional update:

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
Why This Works

MongoDB guarantees document-level atomicity

$gte condition prevents negative stock

Only one update succeeds if stock is low

Why Transactions Were Not Used

MongoDB transactions require replica set configuration.

For simplicity and local development:

Atomic updates were used

In production, this system should run on a replica set with full transaction support

4. Stock Movement Tracking

All stock changes are recorded in StockMovement.

Types:

SALE

PURCHASE

RETURN

ADJUSTMENT

Benefits:

Audit trail

Analytics support

No “hidden” stock mutations

Enables dashboard aggregation

5. Purchase Order Lifecycle

States:

DRAFT → SENT → CONFIRMED → RECEIVED

Supports:

Multiple items per PO

Partial deliveries

Over-receive prevention

Automatic stock increment on receipt

Partial Delivery Handling

Each PO item tracks:

orderedQty
receivedQty

Status changes to RECEIVED only when:

receivedQty === orderedQty (for all items)
6. Smart Low-Stock Alerts

Low-stock logic considers incoming purchase orders.

Formula:

effectiveStock = currentStock + pendingIncomingQty

Where:

pendingIncomingQty = orderedQty - receivedQty (for POs not RECEIVED)

Alert triggered if:

effectiveStock <= reorderLevel

This prevents false alerts when stock is already replenishing.

7. Dashboard & Analytics
Inventory Value
Sum(stock × price)
Top 5 Sellers (30 days)

Aggregation on StockMovement:

Filter SALE

Group by variantId

Sort descending

Limit 5

Stock Movement Graph (7 days)

Grouped by:

Date

Movement type

8. Performance Optimization
Indexing Strategy

Indexes added on:

tenantId (all collections)

{ tenantId, productId }

{ tenantId, createdAt }

{ tenantId, type, createdAt } (StockMovement)

Why?

Prevent full collection scans

Support 10,000+ product scale

Ensure dashboard loads < 2 seconds by :

* Proper indexing

* Filtering by tenantId

* Filtering by date ranges

* Using aggregation pipelines

* Avoiding large document transfer

* Using projections

* Not computing in JavaScript loops unnecessarily

9. Scalability Considerations
Current Design

Single MongoDB instance

Row-level tenant isolation

Future Improvements

Deploy MongoDB replica set (for transactions)

Enable sharding by tenantId

Introduce caching (Redis) for dashboard endpoints

Background job queue for heavy aggregations


11. Security Considerations (Future)

JWT-based authentication

Role-based access control

Request-level tenant validation

Input validation (Zod)

Rate limiting

Final Architecture Summary

This system prioritizes:

Data integrity

Atomic stock updates

Clear tenant isolation

Auditability

Real-world inventory logic

Performance-conscious indexing

Clean TypeScript typing

The design balances simplicity and correctness while leaving room for production-grade scaling.