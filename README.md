# Inventory Platform API

A secure, scalable, stateless REST API for inventory management with user authentication, product management, and order processing with background job queues.

##  Features

### User Management
-  User registration and login
-  Password hashing with bcryptjs
-  JWT-based authentication
-  Role-based access control (admin/user)
-  User profile endpoint

### Product Management
-  Create, read, update, delete products (admin only)
-  Public product listing and details
-  Stock management
-  Product validation with Zod

### Order Management
-  Create orders with multiple items
-  Transactional stock deduction (SELECT FOR UPDATE)
-  Stock availability validation
-  Order history for users
-  Detailed order view with nested items
-  Admin access to all orders
-  Background job processing with BullMQ
-  Automatic invoice generation (JSON files)

### Security & Performance
-  Helmet.js for security headers
-  CORS configuration
-  Rate limiting on login endpoint
-  Request validation with Zod
-  Database connection pooling
-  Transaction support for data integrity

### Logging
-  Winston logger for application logs
-  Worker logs for background jobs

##  Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL
- **Queue System:** BullMQ (with IORedis)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Rate Limiting:** express-rate-limit
- **Logging:** Winston
- **File Operations:** fs-extra

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Redis** (for BullMQ queue system)
- **npm** or **yarn**

##  Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server
   PORT=4000

   # Database
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=inventory_db
   DB_PASSWORD=your_password
   DB_PORT=5432

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=1d

   # Redis (for BullMQ)
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   BULLMQ_HOST=127.0.0.1
   BULLMQ_PORT=6379
   ```

4. **Set up PostgreSQL database**
   
   Create a new database:
   ```sql
   CREATE DATABASE inventory_db;
   ```

5. **Run database migrations**
   
   Create the necessary tables. You can use the following SQL schema:

   ```sql
   -- Users table
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password TEXT NOT NULL,
       role VARCHAR(50) DEFAULT 'user',
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Products table
   CREATE TABLE products (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       description TEXT,
       price DECIMAL(10, 2) NOT NULL,
       stock INTEGER NOT NULL DEFAULT 0,
       image_path VARCHAR(500),
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ
   );

   -- Orders table
   CREATE TABLE orders (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
       total_amount DECIMAL(10, 2) NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Order items table
   CREATE TABLE order_items (
       id SERIAL PRIMARY KEY,
       order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
       product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
       quantity INTEGER NOT NULL,
       price DECIMAL(10, 2) NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Audit log table (optional)
   CREATE TABLE audit_log (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       action VARCHAR(50) NOT NULL,
       resource VARCHAR(100) NOT NULL,
       payload JSONB,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

6. **Update database connection**
   
   Update `src/db/pool.js` with your database credentials, or use environment variables.

##  Running the Application

### Development Mode
```bash
npm run dev
```

This will start the server with nodemon for auto-reloading on file changes.

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:4000` (or the port specified in `.env`).

### Verify Installation

Once the server is running, you should see:
```
PostgreSQL Connected
Server running on port 4000
Order worker started
```

##  Project Structure

```
inventory-platform/
│
├── src/
│   ├── server.js              # Application entry point
│   ├── app.js                  # Express app configuration
│   │
│   ├── config/
│   │   ├── db.js               # Database configuration
│   │   ├── redis.js            # Redis configuration
│   │   └── logger.js           # Winston logger setup
│   │
│   ├── db/
│   │   ├── pool.js             # PostgreSQL connection pool
│   │   └── migrations/         # Database migrations (future)
│   │
│   ├── middlewares/
│   │   ├── auth.js             # JWT authentication middleware
│   │   ├── role.js             # Role-based authorization
│   │   └── validate.js         # Request validation with Zod
│   │
│   ├── routes/
│   │   ├── auth.routes.js      # Authentication routes
│   │   ├── product.routes.js   # Product routes
│   │   └── order.routes.js     # Order routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.js  # Auth business logic
│   │   ├── product.controller.js
│   │   └── order.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js     # Auth data layer
│   │   ├── product.service.js
│   │   └── order.service.js
│   │
│   ├── jobs/
│   │   ├── order.queue.js      # BullMQ queue setup
│   │   └── order.worker.js     # Background job worker
│   │
│   └── invoices/                # Generated invoice JSON files
│
├── logs/                        # Application logs
├── package.json
├── .env                         # Environment variables (not in git)
└── README.md

```

##  API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login and get JWT token | No |
| GET | `/auth/me` | Get current user profile | Yes |

### Products (`/products`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|--------------|
| GET | `/products` | Get all products | No | - |
| GET | `/products/:id` | Get product by ID | No | - |
| POST | `/products` | Create product | Yes | Admin |
| PUT | `/products/:id` | Update product | Yes | Admin |
| DELETE | `/products/:id` | Delete product | Yes | Admin |

### Orders (`/orders`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|--------------|
| POST | `/orders` | Create new order | Yes | Any |
| GET | `/orders/mine` | Get user's orders | Yes | Any |
| GET | `/orders/:id` | Get order details | Yes | Any* |
| GET | `/orders` | Get all orders | Yes | Admin |

*Regular users can only access their own orders; admins can access any order.

##  Testing

Comprehensive Postman testing guides are available:

- **[Authentication Guide](POSTMAN_AUTH_GUIDE.md)** - Test user registration, login, and profile endpoints
- **[Products Guide](POSTMAN_PRODUCTS_GUIDE.md)** - Test product CRUD operations
- **[Orders Guide](POSTMAN_TESTING_GUIDE.md)** - Test order creation and management

### Quick Test Flow

1. Register a user: `POST /auth/register`
2. Login: `POST /auth/login` (save the token)
3. Create products (as admin): `POST /products`
4. Create an order: `POST /orders` (use product IDs)
5. View orders: `GET /orders/mine`
6. Check invoice: Look in `src/invoices/order_X.json`

##  Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting a Token

1. Register a user or login
2. Copy the `token` from the response
3. Include it in the `Authorization` header for protected endpoints

##  Order Processing

When an order is created:

1. **Stock Validation**: System checks if products have sufficient stock
2. **Transaction**: Order and order items are created atomically
3. **Stock Deduction**: Product stock is reduced within the same transaction
4. **Queue Job**: Order is added to BullMQ queue for background processing
5. **Invoice Generation**: Worker processes the job and generates invoice JSON file

### Invoice Files

Invoices are automatically generated in `src/invoices/` directory:
- Format: `order_{orderId}.json`
- Contains: Order details, customer info, items with prices, totals

##  Configuration

### Rate Limiting

Login endpoint has rate limiting:
- **Window**: 15 minutes
- **Max Requests**: 20 per window

### JWT Token

- **Expiration**: Configurable via `JWT_EXPIRES_IN` (default: 1 day)
- **Secret**: Set in `JWT_SECRET` environment variable

### Database Connection

The application uses connection pooling for efficient database connections.

##  Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `src/db/pool.js` or environment variables
- Ensure database `inventory_db` exists

### Redis Connection Error
- Redis is required for BullMQ (order queue system)
- Ensure Redis server is running
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### JWT Token Errors
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration time
- Ensure token is included in `Authorization: Bearer TOKEN` format

### Order Creation Errors
- Verify products exist in database
- Check product stock availability
- Ensure `order_items` table has `price` column (NOT NULL)

##  Dependencies

### Production Dependencies
- `express` - Web framework
- `pg`, `pg-pool` - PostgreSQL client
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `zod` - Schema validation
- `bullmq`, `ioredis` - Background job queue
- `winston` - Logging
- `helmet` - Security headers
- `cors` - CORS middleware
- `express-rate-limit` - Rate limiting
- `fs-extra` - File operations
- `dotenv` - Environment variables

### Development Dependencies
- `nodemon` - Auto-reload during development

##  Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Helmet.js security headers
- CORS configuration
- Rate limiting on sensitive endpoints
- Input validation with Zod
- SQL injection protection (parameterized queries)
- Transaction support for data integrity

##  License

ISC

##  Author

Inventory Platform API

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

##  Support

For issues and questions, please open an issue in the repository.

---

**Note**: Make sure to keep your `.env` file secure and never commit it to version control. The `.env` file should be in `.gitignore`.

