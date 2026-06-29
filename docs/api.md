# Order Service API Documentation

## Overview
The Order Service provides a RESTful API for managing orders with complete CRUD operations. The service includes input validation, comprehensive error handling, and in-memory persistence.

## Base URL
```
http://localhost:8000
```

## Endpoints

### 1. Create Order
**POST** `/orders`

Creates a new order with validation.

#### Request Body
```json
{
  "customerId": "string (required)",
  "items": [
    {
      "name": "string (required)",
      "quantity": "number (required, > 0)",
      "price": "number (required, > 0)"
    }
  ],
  "status": "string (optional, default: 'pending')"
}
```

#### Valid Status Values
- `pending` (default)
- `processing`
- `shipped`
- `delivered`
- `cancelled`

#### Response
**Success (201)**
```json
{
  "id": 1,
  "customerId": "customer-123",
  "items": [
    {
      "name": "Product A",
      "quantity": 2,
      "price": 25.99
    }
  ],
  "status": "pending",
  "total": 51.98,
  "createdAt": "2025-06-03T14:00:00.000Z",
  "updatedAt": "2025-06-03T14:00:00.000Z"
}
```

**Validation Error (400)**
```json
{
  "error": "Validation failed",
  "details": [
    "customerId is required and must be a string",
    "items is required and must be a non-empty array"
  ]
}
```

### 2. Get All Orders
**GET** `/orders`

Retrieves all orders.

#### Response
**Success (200)**
```json
[
  {
    "id": 1,
    "customerId": "customer-123",
    "items": [...],
    "status": "pending",
    "total": 51.98,
    "createdAt": "2025-06-03T14:00:00.000Z",
    "updatedAt": "2025-06-03T14:00:00.000Z"
  }
]
```

### 3. Search/Filter Orders
**GET** `/orders/search`

Search and filter orders by customer ID, status, or date range. All query parameters are optional and can be combined. Returns full order details including items with names and quantities.

#### Query Parameters
| Parameter    | Type   | Description |
|-------------|--------|-------------|
| `customerId` | string | Filter by customer ID (case-insensitive partial match) |
| `status`     | string | Filter by order status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) |
| `startDate`  | string | Filter orders created on or after this date (ISO 8601 format) |
| `endDate`    | string | Filter orders created on or before this date (ISO 8601 format) |

#### Response
**Success (200)**
```json
[
  {
    "id": 1,
    "customerId": "customer-123",
    "items": [
      {
        "name": "Product A",
        "quantity": 2,
        "price": 25.99
      }
    ],
    "status": "pending",
    "total": 51.98,
    "createdAt": "2025-06-03T14:00:00.000Z",
    "updatedAt": "2025-06-03T14:00:00.000Z"
  }
]
```

**Invalid Status (400)**
```json
{
  "error": "Invalid status filter",
  "message": "status must be one of: pending, processing, shipped, delivered, cancelled"
}
```

**Invalid Date (400)**
```json
{
  "error": "Invalid date format",
  "message": "startDate must be a valid ISO 8601 date string"
}
```

### 4. Get Order by ID
**GET** `/orders/:id`

Retrieves a specific order by ID.

#### Parameters
- `id` (number): Order ID

#### Response
**Success (200)**
```json
{
  "id": 1,
  "customerId": "customer-123",
  "items": [...],
  "status": "pending",
  "total": 51.98,
  "createdAt": "2025-06-03T14:00:00.000Z",
  "updatedAt": "2025-06-03T14:00:00.000Z"
}
```

**Not Found (404)**
```json
{
  "error": "Order not found",
  "message": "Order with ID 999 does not exist"
}
```

**Invalid ID (400)**
```json
{
  "error": "Invalid order ID",
  "message": "Order ID must be a valid number"
}
```

### 5. Update Order
**PUT** `/orders/:id`

Updates an existing order.

#### Parameters
- `id` (number): Order ID

#### Request Body
Same as Create Order request body.

#### Response
**Success (200)**
```json
{
  "id": 1,
  "customerId": "customer-456",
  "items": [...],
  "status": "processing",
  "total": 40.00,
  "createdAt": "2025-06-03T14:00:00.000Z",
  "updatedAt": "2025-06-03T14:05:00.000Z"
}
```

**Not Found (404)**
```json
{
  "error": "Order not found",
  "message": "Order with ID 999 does not exist"
}
```

### 6. Delete Order
**DELETE** `/orders/:id`

Deletes an order by ID.

#### Parameters
- `id` (number): Order ID

#### Response
**Success (200)**
```json
{
  "message": "Order deleted successfully",
  "order": {
    "id": 1,
    "customerId": "customer-123",
    "items": [...],
    "status": "pending",
    "total": 51.98,
    "createdAt": "2025-06-03T14:00:00.000Z",
    "updatedAt": "2025-06-03T14:00:00.000Z"
  }
}
```

**Not Found (404)**
```json
{
  "error": "Order not found",
  "message": "Order with ID 999 does not exist"
}
```

## Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid input data or validation errors
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

Error responses include descriptive messages and, where applicable, detailed validation error lists.

## Examples

### Create an Order
```bash
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "items": [
      {
        "name": "Product A",
        "quantity": 2,
        "price": 25.99
      }
    ],
    "status": "pending"
  }'
```

### Get All Orders
```bash
curl http://localhost:8000/orders
```

### Search Orders
```bash
# Search by customer ID
curl "http://localhost:8000/orders/search?customerId=customer-123"

# Search by status
curl "http://localhost:8000/orders/search?status=pending"

# Search by date range
curl "http://localhost:8000/orders/search?startDate=2025-01-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.999Z"

# Combine multiple filters
curl "http://localhost:8000/orders/search?customerId=customer-123&status=pending"
```

### Get Order by ID
```bash
curl http://localhost:8000/orders/1
```

### Update Order
```bash
curl -X PUT http://localhost:8000/orders/1 \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-456",
    "items": [
      {
        "name": "Product B",
        "quantity": 1,
        "price": 30.00
      }
    ],
    "status": "processing"
  }'
```

### Delete Order
```bash
curl -X DELETE http://localhost:8000/orders/1
```