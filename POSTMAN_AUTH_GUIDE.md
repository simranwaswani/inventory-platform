# Postman Testing Guide - Authentication Endpoints

## Base URL
```
http://localhost:4000
```

---

## Overview

The authentication system provides user registration, login, and profile access. All endpoints are under `/auth`.

---

## Endpoints

1. **POST** `/auth/register` - Register a new user
2. **POST** `/auth/login` - Login and get JWT token
3. **GET** `/auth/me` - Get current user profile (requires authentication)

---

## 1. Register a New User

### Endpoint
**POST** `http://localhost:4000/auth/register`

### Headers
```
Content-Type: application/json
```

### Request Body (raw JSON)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Field Descriptions
- `name` (required): User's full name
- `email` (required): User's email address (must be unique)
- `password` (required): User's password (will be hashed)
- `role` (optional): User role - either `"user"` or `"admin"` (defaults to `"user"`)

### Success Response (201)
```json
{
  "message": "User registered",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2025-11-27T12:00:00.000Z"
  }
}
```

### Error Responses

#### 400 - Duplicate Email
```json
{
  "message": "Email already exists"
}
```

#### 400 - Missing Fields
```json
{
  "message": "Name, email, and password are required"
}
```

---

## 2. Login (Get JWT Token)

### Endpoint
**POST** `http://localhost:4000/auth/login`

### Headers
```
Content-Type: application/json
```

### Request Body (raw JSON)
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Field Descriptions
- `email` (required): User's email address
- `password` (required): User's password

### Success Response (200)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MzI3ODQwMDAsImV4cCI6MTczMjc4NzYwMH0.xxxxx",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value - you'll need it for authenticated endpoints!

### Error Responses

#### 400 - Invalid Credentials
```json
{
  "message": "Invalid email or password"
}
```

#### 400 - Missing Fields
```json
{
  "message": "Email and password are required"
}
```

#### 429 - Too Many Requests
If you exceed the rate limit (20 requests per 15 minutes):
```json
{
  "message": "Too many requests, please try again later"
}
```

---

## 3. Get Current User Profile

### Endpoint
**GET** `http://localhost:4000/auth/me`

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Note:** Replace `YOUR_TOKEN_HERE` with the token you received from the login endpoint.

### Success Response (200)
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Error Responses

#### 401 - Unauthorized (No Token)
```json
{
  "message": "No token provided"
}
```

#### 401 - Invalid Token
```json
{
  "message": "Invalid token",
  "error": "jwt malformed"
}
```

#### 401 - User Not Found
```json
{
  "message": "User not found"
}
```

---

## Complete Testing Flow

### Step 1: Register a User
1. Set method to **POST**
2. URL: `http://localhost:4000/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "test123",
     "role": "user"
   }
   ```
5. Send request
6. Verify you get a 201 response with user details

### Step 2: Register an Admin User
1. Same as Step 1, but set `"role": "admin"`
2. Use a different email (e.g., `"admin@example.com"`)
3. Save this for admin operations

### Step 3: Login as Regular User
1. Set method to **POST**
2. URL: `http://localhost:4000/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```
5. Send request
6. **Copy the token** from the response
7. Save it as `user_token` in Postman environment

### Step 4: Login as Admin User
1. Same as Step 3, but use admin credentials
2. **Copy the token** from the response
3. Save it as `admin_token` in Postman environment

### Step 5: Test /auth/me Endpoint
1. Set method to **GET**
2. URL: `http://localhost:4000/auth/me`
3. Headers:
   - `Authorization: Bearer {{user_token}}`
4. Send request
5. Verify you get your user profile

---

## Postman Environment Setup

### Create Environment Variables

1. Click on **Environments** in Postman
2. Create a new environment (e.g., "Inventory Platform")
3. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:4000` | `http://localhost:4000` |
| `user_token` | (empty) | (will be set after login) |
| `admin_token` | (empty) | (will be set after login) |
| `user_email` | `test@example.com` | `test@example.com` |
| `admin_email` | `admin@example.com` | `admin@example.com` |

### Auto-Save Token Script

Add this to your **Login** request under **Tests** tab:

```javascript
// Auto-save token to environment
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    
    // Save token based on user role
    if (jsonData.user.role === "admin") {
        pm.environment.set("admin_token", jsonData.token);
        console.log("Admin token saved");
    } else {
        pm.environment.set("user_token", jsonData.token);
        console.log("User token saved");
    }
    
    // Save user email
    pm.environment.set("user_email", jsonData.user.email);
}
```

### Using Environment Variables

In your requests, use:
- URL: `{{base_url}}/auth/login`
- Header: `Authorization: Bearer {{user_token}}`

---

## Testing Scenarios

### Scenario 1: Successful Registration
- Register with valid data
- Should return 201 with user object
- User should be able to login immediately

### Scenario 2: Duplicate Email Registration
- Try to register with an existing email
- Should return 400 error

### Scenario 3: Successful Login
- Login with correct credentials
- Should return 200 with token and user data

### Scenario 4: Invalid Login Credentials
- Login with wrong password
- Should return 400 error

### Scenario 5: Get Profile Without Token
- Call `/auth/me` without Authorization header
- Should return 401 error

### Scenario 6: Get Profile With Invalid Token
- Call `/auth/me` with malformed token
- Should return 401/403 error

### Scenario 7: Get Profile With Valid Token
- Call `/auth/me` with valid token
- Should return 200 with user profile

### Scenario 8: Rate Limiting
- Make 21+ login requests within 15 minutes
- Should return 429 error after limit

---

## Common Issues & Solutions

### Issue: "No token provided"
**Solution:** Make sure you include the `Authorization` header with `Bearer` prefix

### Issue: "Invalid token"
**Solution:** 
- Token might have expired (check JWT_SECRET in .env)
- Token might be malformed (copy entire token from login response)

### Issue: "Email already exists"
**Solution:** Use a different email address or delete the existing user from database

### Issue: "Invalid email or password"
**Solution:** 
- Verify email and password are correct
- Check if user exists in database
- Ensure password matches what was used during registration

### Issue: Token expires quickly
**Solution:** Check `JWT_EXPIRY` in your `.env` file and adjust if needed

---

## Sample Test Data

### Regular User
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Admin User
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### Test User 2
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "jane123",
  "role": "user"
}
```

---

## Next Steps

After completing authentication testing:
1. Use the tokens to test **Product endpoints** (see `POSTMAN_PRODUCTS_GUIDE.md`)
2. Use the tokens to test **Order endpoints** (see `POSTMAN_TESTING_GUIDE.md`)

---

## Quick Reference

| Endpoint | Method | Auth Required | Role Required |
|----------|--------|---------------|---------------|
| `/auth/register` | POST | No | None |
| `/auth/login` | POST | No | None |
| `/auth/me` | GET | Yes | Any |

