# Postman Testing Guide - Product Endpoints

## Base URL
```
http://localhost:4000
```

---

## Overview

The product management system provides CRUD operations for products. Some endpoints are public (GET), while create/update/delete operations require admin authentication.

---

## Endpoints

1. **GET** `/products` - Get all products (Public)
2. **GET** `/products/:id` - Get product by ID (Public)
3. **POST** `/products` - Create product (Admin only)
4. **PUT** `/products/:id` - Update product (Admin only)
5. **DELETE** `/products/:id` - Delete product (Admin only)

---

## Prerequisites

Before testing product endpoints, you need:
1. An admin user account (register with `"role": "admin"`)
2. Admin JWT token (obtain from `/auth/login`)

See `POSTMAN_AUTH_GUIDE.md` for authentication setup.

---

## 1. Get All Products (Public)

### Endpoint
**GET** `http://localhost:4000/products`

### Headers
```
(No authentication required)
```

### Query Parameters (Optional)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Search term for product name/description

### Example URLs
```
http://localhost:4000/products
http://localhost:4000/products?page=1&limit=10
http://localhost:4000/products?minPrice=100&maxPrice=500
http://localhost:4000/products?search=laptop
http://localhost:4000/products?page=2&limit=5&minPrice=50&maxPrice=1000&search=keyboard
```

### Success Response (200)
```json
{
  "products": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High performance laptop",
      "price": "999.99",
      "stock": 10,
      "created_at": "2025-11-27T12:00:00.000Z",
      "updated_at": null
    },
    {
      "id": 2,
      "name": "Mouse",
      "description": "Wireless mouse",
      "price": "29.99",
      "stock": 50,
      "created_at": "2025-11-27T12:00:00.000Z",
      "updated_at": null
    }
  ]
}
```

### Error Responses

#### 500 - Server Error
```json
{
  "message": "Database error message"
}
```

---

## 2. Get Product by ID (Public)

### Endpoint
**GET** `http://localhost:4000/products/:id`

### Headers
```
(No authentication required)
```

### URL Parameters
- `id` - Product ID (number)

### Example
**GET** `http://localhost:4000/products/1`

### Success Response (200)
```json
{
  "product": {
    "id": 1,
    "name": "Laptop",
    "description": "High performance laptop",
    "price": "999.99",
    "stock": 10,
    "image_path": null,
    "created_at": "2025-11-27T12:00:00.000Z",
    "updated_at": null
  }
}
```

### Error Responses

#### 404 - Product Not Found
```json
{
  "message": "Product not found"
}
```

---

## 3. Create Product (Admin Only)

### Endpoint
**POST** `http://localhost:4000/products`

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

### Request Body (raw JSON)
```json
{
  "name": "Laptop",
  "description": "High performance laptop with 16GB RAM",
  "price": 999.99,
  "stock": 10
}
```

### Field Descriptions
- `name` (required): Product name
- `description` (required): Product description
- `price` (required): Product price (number)
- `stock` (required): Available stock quantity (number)

### Success Response (201)
```json
{
  "product": {
    "id": 1,
    "name": "Laptop",
    "description": "High performance laptop with 16GB RAM",
    "price": "999.99",
    "stock": 10,
    "created_at": "2025-11-27T12:00:00.000Z",
    "updated_at": null
  }
}
```

### Error Responses

#### 400 - Validation Error
```json
{
  "message": "Name, description, price, and stock are required"
}
```

#### 401 - Unauthorized
```json
{
  "message": "No token provided"
}
```

#### 403 - Forbidden (Not Admin)
```json
{
  "message": "Forbidden: Insufficient role"
}
```

---

## 4. Update Product (Admin Only)

### Endpoint
**PUT** `http://localhost:4000/products/:id`

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

### URL Parameters
- `id` - Product ID to update (number)

### Request Body (raw JSON)
```json
{
  "name": "Gaming Laptop",
  "description": "Updated description",
  "price": 1299.99,
  "stock": 5
}
```

**Note:** All fields are optional - you can update only the fields you want to change.

### Example
**PUT** `http://localhost:4000/products/1`

### Success Response (200)
```json
{
  "product": {
    "id": 1,
    "name": "Gaming Laptop",
    "description": "Updated description",
    "price": "1299.99",
    "stock": 5,
    "updated_at": "2025-11-27T13:00:00.000Z"
  }
}
```

### Error Responses

#### 400 - Product Not Found
```json
{
  "message": "Product not found"
}
```

#### 403 - Forbidden (Not Admin)
```json
{
  "message": "Forbidden: Insufficient role"
}
```

---

## 5. Delete Product (Admin Only)

### Endpoint
**DELETE** `http://localhost:4000/products/:id`

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

### URL Parameters
- `id` - Product ID to delete (number)

### Example
**DELETE** `http://localhost:4000/products/1`

### Success Response (200)
```json
{
  "message": "Product deleted successfully"
}
```

### Error Responses

#### 400 - Product in Use
```json
{
  "message": "Cannot delete product: Product is part of an existing order"
}
```

#### 400 - Product Not Found
```json
{
  "message": "Product not found"
}
```

#### 403 - Forbidden (Not Admin)
```json
{
  "message": "Forbidden: Insufficient role"
}
```

---

## Complete Testing Flow

### Step 1: Get All Products (Verify Empty/Existing Products)
1. Set method to **GET**
2. URL: `http://localhost:4000/products`
3. No headers needed
4. Send request
5. Note existing product IDs if any

### Step 2: Create a Product (Admin)
1. Set method to **POST**
2. URL: `http://localhost:4000/products`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {{admin_token}}`
4. Body (raw JSON):
   ```json
   {
     "name": "Laptop",
     "description": "High performance laptop",
     "price": 999.99,
     "stock": 10
   }
   ```
5. Send request
6. **Save the product ID** from response (e.g., `product_id: 1`)

### Step 3: Get Product by ID
1. Set method to **GET**
2. URL: `http://localhost:4000/products/1` (use ID from Step 2)
3. No headers needed
4. Send request
5. Verify product details

### Step 4: Update Product (Admin)
1. Set method to **PUT**
2. URL: `http://localhost:4000/products/1`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {{admin_token}}`
4. Body (raw JSON):
   ```json
   {
     "name": "Gaming Laptop",
     "price": 1299.99,
     "stock": 5
   }
   ```
5. Send request
6. Verify updated fields

### Step 5: Get All Products Again
1. Repeat Step 1
2. Verify your product appears in the list
3. Verify updated values are reflected

### Step 6: Create More Products (For Order Testing)
Create at least 2-3 products with different IDs for testing orders:
- Product 1: Laptop (ID: 1)
- Product 2: Mouse (ID: 2)
- Product 3: Keyboard (ID: 3)

### Step 7: Delete Product (Admin)
1. Set method to **DELETE**
2. URL: `http://localhost:4000/products/3` (use a product not in any order)
3. Headers:
   - `Authorization: Bearer {{admin_token}}`
4. Send request
5. Verify deletion

---

## Postman Environment Setup

### Add Product Variables

Add these to your Postman environment:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:4000` | `http://localhost:4000` |
| `admin_token` | (empty) | (set after admin login) |
| `product_id` | (empty) | (set after creating product) |

### Auto-Save Product ID Script

Add this to your **Create Product** request under **Tests** tab:

```javascript
// Auto-save product ID
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("product_id", jsonData.product.id);
    console.log("Product ID saved: " + jsonData.product.id);
}
```

### Using Environment Variables

In your requests, use:
- URL: `{{base_url}}/products/{{product_id}}`
- Header: `Authorization: Bearer {{admin_token}}`

---

## Testing Scenarios

### Scenario 1: Create Product as Admin
- Create product with valid data
- Should return 201 with product object
- Product should appear in GET /products

### Scenario 2: Create Product as Regular User
- Try to create product with user token (not admin)
- Should return 403 Forbidden error

### Scenario 3: Create Product Without Token
- Try to create product without Authorization header
- Should return 401 Unauthorized error

### Scenario 4: Get All Products (Public)
- Call GET /products without authentication
- Should return 200 with products array

### Scenario 5: Get Non-Existent Product
- Call GET /products/99999
- Should return 404 Not Found

### Scenario 6: Update Product
- Update product with new values
- Should return 200 with updated product
- GET /products/:id should show updated values

### Scenario 7: Delete Product Not in Orders
- Delete a product that's not part of any order
- Should return 200 success

### Scenario 8: Delete Product in Orders
- Try to delete a product that's part of an existing order
- Should return 400 error with message about order constraint

### Scenario 9: Update Non-Existent Product
- Try to update product with invalid ID
- Should return 400/404 error

---

## Sample Test Data

### Product 1 - Laptop
```json
{
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop with RTX 4060",
  "price": 1299.99,
  "stock": 15
}
```

### Product 2 - Mouse
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with 2-year battery",
  "price": 29.99,
  "stock": 50
}
```

### Product 3 - Keyboard
```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with Cherry MX switches",
  "price": 149.99,
  "stock": 30
}
```

### Product 4 - Monitor
```json
{
  "name": "4K Monitor",
  "description": "27-inch 4K UHD monitor with HDR",
  "price": 399.99,
  "stock": 20
}
```

### Product 5 - Headphones
```json
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling wireless headphones",
  "price": 199.99,
  "stock": 25
}
```

---

## Common Issues & Solutions

### Issue: "Forbidden: Insufficient role"
**Solution:** 
- Make sure you're using an admin token
- Verify the user's role is "admin" in the database
- Re-login as admin to get a fresh token

### Issue: "No token provided"
**Solution:** Add `Authorization: Bearer YOUR_TOKEN` header

### Issue: "Product not found"
**Solution:** 
- Verify the product ID exists
- Check if product was deleted
- Use GET /products to see available product IDs

### Issue: "Cannot delete product: Product is part of an existing order"
**Solution:** 
- This is expected behavior - products in orders cannot be deleted
- Delete the order first, or use a different product for testing

### Issue: Validation errors
**Solution:** 
- Ensure all required fields are provided (name, description, price, stock)
- Verify price and stock are numbers, not strings
- Check for typos in field names

---

## Quick Reference

| Endpoint | Method | Auth Required | Role Required | Public |
|----------|--------|---------------|---------------|--------|
| `/products` | GET | No | None | ✅ Yes |
| `/products/:id` | GET | No | None | ✅ Yes |
| `/products` | POST | Yes | Admin | ❌ No |
| `/products/:id` | PUT | Yes | Admin | ❌ No |
| `/products/:id` | DELETE | Yes | Admin | ❌ No |

---

## Integration with Orders

After creating products, you can use their IDs to test order endpoints:

1. Create products and note their IDs
2. Use these IDs in order creation:
   ```json
   {
     "items": [
       { "product_id": 1, "qty": 2 },
       { "product_id": 2, "qty": 1 }
     ]
   }
   ```

See `POSTMAN_TESTING_GUIDE.md` for order endpoint testing.

---

## Next Steps

1. ✅ Complete authentication setup (see `POSTMAN_AUTH_GUIDE.md`)
2. ✅ Create products using admin account
3. ✅ Test order creation with product IDs (see `POSTMAN_TESTING_GUIDE.md`)

