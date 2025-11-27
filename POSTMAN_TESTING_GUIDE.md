# Postman Testing Guide - Order Endpoints

## Base URL
```
http://localhost:4000
```

---

## Prerequisites

Before testing order endpoints, ensure you have:

1. **User Account & Token**
   - Register and login to get a JWT token
   - See `POSTMAN_AUTH_GUIDE.md` for authentication setup

2. **Products in Database**
   - Create at least 2-3 products using admin account
   - Note the product IDs for order creation
   - See `POSTMAN_PRODUCTS_GUIDE.md` for product setup

3. **Admin Account (Optional)**
   - For testing GET all orders endpoint
   - Register/login as admin user

---

## Overview

The order system allows users to:
- Create orders with multiple items
- View their own orders
- View order details with nested items
- Admins can view all orders

All order endpoints require authentication.

---

## Endpoints

1. **POST** `/orders` - Create an order (any logged-in user)
2. **GET** `/orders/mine` - Get logged-in user's orders
3. **GET** `/orders/:id` - Get order by ID with nested items
4. **GET** `/orders` - Get all orders (admin only)

---

## 1. Create an Order

### Endpoint
**POST** `http://localhost:4000/orders`

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Request Body (raw JSON)
```json
{
  "items": [
    {
      "product_id": 1,
      "qty": 2
    },
    {
      "product_id": 2,
      "qty": 1
    }
  ]
}
```

### Field Descriptions
- `items` (required): Array of order items
  - `product_id` (required): Product ID (must be a positive integer)
  - `qty` (required): Quantity to order (must be a positive integer)

### Success Response (201)
```json
{
  "message": "Order created and job queued",
  "order": {
    "id": 1,
    "user_id": 1,
    "total_amount": "1999.98",
    "created_at": "2025-11-27T12:00:00.000Z"
  }
}
```

### Important Notes
- **Stock Check**: The system automatically checks stock availability
- **Stock Deduction**: Stock is deducted atomically within a transaction
- **Background Processing**: Order is queued for invoice generation
- **Invoice**: Invoice JSON file will be generated in `/src/invoices/order_X.json`

### Error Responses

#### 400 - Validation Error
```json
{
  "message": "Validation error",
  "errors": [
    {
      "path": ["items", 0, "product_id"],
      "message": "Expected number, received string"
    }
  ]
}
```

#### 400 - Product Not Found
```json
{
  "message": "Product with ID 999 not found"
}
```

#### 400 - Insufficient Stock
```json
{
  "message": "Insufficient stock for product 1. Available: 5, Requested: 10"
}
```

#### 401 - Unauthorized
```json
{
  "message": "No token provided"
}
```

---

## 2. Get My Orders (Logged-in User's Orders)

### Endpoint
**GET** `http://localhost:4000/orders/mine`

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Success Response (200)
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "total_amount": "1999.98",
      "created_at": "2025-11-27T12:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "total_amount": "500.00",
      "created_at": "2025-11-27T13:00:00.000Z"
    }
  ]
}
```

### Error Responses

#### 401 - Unauthorized
```json
{
  "message": "No token provided"
}
```

---

## 3. Get Order by ID (with Nested Items)

### Endpoint
**GET** `http://localhost:4000/orders/:id`

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### URL Parameters
- `id` - Order ID (number)

### Example
**GET** `http://localhost:4000/orders/1`

### Success Response (200)
```json
{
  "order": {
    "id": 1,
    "user_id": 1,
    "total_amount": "1999.98",
    "created_at": "2025-11-27T12:00:00.000Z",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "product_name": "Laptop",
        "product_price": "999.99"
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 2,
        "quantity": 1,
        "product_name": "Mouse",
        "product_price": "29.99"
      }
    ]
  }
}
```

### Access Control
- **Regular Users**: Can only view their own orders
- **Admin Users**: Can view any order

### Error Responses

#### 404 - Order Not Found
```json
{
  "message": "Order not found"
}
```

#### 401 - Unauthorized
```json
{
  "message": "No token provided"
}
```

---

## 4. Get All Orders (Admin Only)

### Endpoint
**GET** `http://localhost:4000/orders`

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Note:** You must login as an admin user (role: "admin") to access this endpoint.

### Success Response (200)
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "total_amount": "1999.98",
      "created_at": "2025-11-27T12:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "total_amount": "500.00",
      "created_at": "2025-11-27T13:00:00.000Z"
    }
  ]
}
```

### Error Responses

#### 403 - Forbidden
```json
{
  "message": "Forbidden: Insufficient role"
}
```

#### 401 - Unauthorized
```json
{
  "message": "No token provided"
}
```

---

## Complete Testing Flow

### Step 1: Prerequisites Setup
1. **Get Authentication Token**
   - Register/login using `POSTMAN_AUTH_GUIDE.md`
   - Save the token (e.g., `user_token`)

2. **Create Products**
   - Create at least 2-3 products using `POSTMAN_PRODUCTS_GUIDE.md`
   - Note the product IDs (e.g., product_id: 1, 2, 3)

### Step 2: Create an Order
1. Set method to **POST**
2. URL: `http://localhost:4000/orders`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {{user_token}}`
4. Body (raw JSON):
   ```json
   {
     "items": [
       { "product_id": 1, "qty": 2 },
       { "product_id": 2, "qty": 1 }
     ]
   }
   ```
5. Send request
6. **Save the order ID** from response (e.g., `order_id: 1`)

### Step 3: Get My Orders
1. Set method to **GET**
2. URL: `http://localhost:4000/orders/mine`
3. Headers:
   - `Authorization: Bearer {{user_token}}`
4. Send request
5. Verify your order appears in the list

### Step 4: Get Order by ID
1. Set method to **GET**
2. URL: `http://localhost:4000/orders/1` (use order ID from Step 2)
3. Headers:
   - `Authorization: Bearer {{user_token}}`
4. Send request
5. Verify order details with nested items

### Step 5: Check Invoice Generation
1. Wait a few seconds for background processing
2. Check the file: `src/invoices/order_1.json`
3. Verify invoice contains order details

### Step 6: Get All Orders (Admin)
1. Login as admin user
2. Set method to **GET**
3. URL: `http://localhost:4000/orders`
4. Headers:
   - `Authorization: Bearer {{admin_token}}`
5. Send request
6. Verify all orders are returned

---

## Postman Environment Setup

### Create Environment Variables

1. Click on **Environments** in Postman
2. Create/use existing environment (e.g., "Inventory Platform")
3. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:4000` | `http://localhost:4000` |
| `user_token` | (empty) | (set after login) |
| `admin_token` | (empty) | (set after admin login) |
| `order_id` | (empty) | (set after creating order) |
| `product_id_1` | `1` | `1` |
| `product_id_2` | `2` | `2` |

### Auto-Save Order ID Script

Add this to your **Create Order** request under **Tests** tab:

```javascript
// Auto-save order ID
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("order_id", jsonData.order.id);
    console.log("Order ID saved: " + jsonData.order.id);
}
```

### Using Environment Variables

In your requests, use:
- URL: `{{base_url}}/orders/{{order_id}}`
- Header: `Authorization: Bearer {{user_token}}`
- Body: `{ "product_id": {{product_id_1}}, "qty": 2 }`

---

## Testing Scenarios

### Scenario 1: Normal Order Creation
- Create order with valid products and quantities
- Should return 201 with order details
- Stock should be deducted automatically
- Invoice should be generated in background

### Scenario 2: Insufficient Stock
- Try to order more than available stock
- Should return 400 error with stock details
- Stock should NOT be deducted

### Scenario 3: Invalid Product ID
- Use non-existent product_id
- Should return 400 error "Product with ID X not found"

### Scenario 4: Empty Items Array
- Send empty items array: `{ "items": [] }`
- Should return 400 validation error

### Scenario 5: Invalid Item Format
- Send invalid format (e.g., `product_id` as string)
- Should return 400 validation error

### Scenario 6: Negative Quantities
- Try to order with negative qty
- Should return 400 validation error

### Scenario 7: Unauthorized Access
- Try to access without token
- Should return 401 error

### Scenario 8: Get Non-Existent Order
- Try to get order with invalid ID
- Should return 404 error

### Scenario 9: User Accessing Another User's Order
- User A tries to get User B's order
- Should return 404 error (order not found for that user)

### Scenario 10: Admin Accessing All Orders
- Admin gets all orders
- Should return 200 with all orders from all users

### Scenario 11: Regular User Accessing All Orders
- Regular user tries GET /orders (without /mine)
- Should return 403 Forbidden error

### Scenario 12: Multiple Items in One Order
- Create order with 3+ different products
- Should calculate total correctly
- All items should appear in order details

---

## Common Errors & Solutions

### Error: "No token provided"
**Problem:** Missing Authorization header  
**Solution:** Add `Authorization: Bearer YOUR_TOKEN` header

### Error: "Invalid token"
**Problem:** Token is expired or malformed  
**Solution:** 
- Re-login to get a fresh token
- Verify token is copied completely

### Error: "Product with ID X not found"
**Problem:** Product doesn't exist  
**Solution:** 
- Verify product IDs exist in database
- Use GET /products to see available products

### Error: "Insufficient stock for product X"
**Problem:** Not enough stock available  
**Solution:** 
- Check product stock using GET /products/:id
- Order less quantity or update product stock

### Error: "Validation error"
**Problem:** Invalid request body format  
**Solution:** 
- Ensure `items` is an array
- `product_id` and `qty` must be numbers (not strings)
- Both must be positive integers

### Error: "Forbidden: Insufficient role"
**Problem:** Trying to access admin endpoint as regular user  
**Solution:** Login as admin user (role: "admin")

### Error: "Order not found"
**Problem:** Order doesn't exist or user doesn't have access  
**Solution:** 
- Verify order ID is correct
- Ensure you're accessing your own order (or are admin)

---

## Sample Test Data

### Order with Single Item
```json
{
  "items": [
    {
      "product_id": 1,
      "qty": 1
    }
  ]
}
```

### Order with Multiple Items
```json
{
  "items": [
    {
      "product_id": 1,
      "qty": 2
    },
    {
      "product_id": 2,
      "qty": 1
    },
    {
      "product_id": 3,
      "qty": 3
    }
  ]
}
```

### Order with Large Quantities
```json
{
  "items": [
    {
      "product_id": 1,
      "qty": 10
    }
  ]
}
```

---

## Invoice Generation

After creating an order:
1. Order is added to BullMQ queue
2. Worker processes the order in background
3. Invoice JSON file is generated in `src/invoices/order_X.json`

### Invoice File Location
```
src/invoices/order_1.json
src/invoices/order_2.json
...
```

### Invoice Structure
```json
{
  "invoice_id": "INV-1",
  "order_id": 1,
  "generated_at": "2025-11-27T12:00:00.000Z",
  "customer": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "order_date": "2025-11-27T12:00:00.000Z",
  "items": [
    {
      "product_id": 1,
      "product_name": "Laptop",
      "quantity": 2,
      "unit_price": "999.99",
      "subtotal": "1999.98"
    }
  ],
  "total_amount": 1999.98
}
```

---

## Quick Reference

| Endpoint | Method | Auth Required | Role Required | Description |
|----------|--------|---------------|---------------|-------------|
| `/orders` | POST | Yes | Any | Create new order |
| `/orders/mine` | GET | Yes | Any | Get user's orders |
| `/orders/:id` | GET | Yes | Any* | Get order details |
| `/orders` | GET | Yes | Admin | Get all orders |

*Regular users can only access their own orders; admins can access any order.

---

## Integration with Other Modules

### Authentication
- See `POSTMAN_AUTH_GUIDE.md` for:
  - User registration
  - Login and token management
  - User profile access

### Products
- See `POSTMAN_PRODUCTS_GUIDE.md` for:
  - Creating products
  - Getting product details
  - Managing product stock

---

## Next Steps

1. ✅ Complete authentication setup (see `POSTMAN_AUTH_GUIDE.md`)
2. ✅ Create products (see `POSTMAN_PRODUCTS_GUIDE.md`)
3. ✅ Test order creation and management (this guide)
4. ✅ Verify invoice generation in `src/invoices/` directory
