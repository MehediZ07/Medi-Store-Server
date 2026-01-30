# MediStore Backend

A comprehensive medicine store API built with Node.js, Express, Prisma, and PostgreSQL. Features JWT authentication, role-based access control, and complete e-commerce functionality.

## Features

- **JWT Authentication**: Secure token-based authentication with immediate login (no email verification)
- **Medicine Management**: Complete medicine catalog with categories and stock management
- **Order System**: Order placement and management with status tracking
- **Review System**: Customer reviews and ratings for medicines
- **Category Management**: Medicine categories for better organization
- **Admin Panel**: User management and platform statistics
- **Seller Dashboard**: Seller medicine and order management with analytics
- **Search & Filtering**: Advanced medicine search with multiple filters
- **Role-based Access**: Customer, Seller, and Admin role management

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT implementation with bcrypt
- **Validation**: Zod for request validation
- **Development**: tsx for TypeScript execution
- **Deployment**: Vercel

## Project Structure

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── lib/
│   ├── auth.ts              # Better Auth configuration (minimal)
│   └── prisma.ts            # Database client setup
├── middlewares/
│   ├── auth.ts              # JWT authentication middleware
│   ├── globalErrorHandler.ts # Global error handling
│   ├── notFound.ts          # 404 handler
│   └── roleValidation.ts    # Role validation middleware
├── modules/
│   ├── auth/                # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.router.ts
│   ├── medicine/            # Medicine management module
│   ├── order/               # Order management module
│   ├── review/              # Review system module
│   ├── category/            # Category management module
│   ├── seller/              # Seller management module
│   └── admin/               # Admin management module
├── helpers/
│   └── paginationSortingHelper.ts # Pagination utility
└── scripts/
    ├── seedAdmin.ts         # Admin user seeding script
    └── seedDatabase.ts      # Database seeding script

prisma/
├── schema.prisma            # Prisma schema with all models
└── migrations/              # Database migration files
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (Neon recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediStoreBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   PORT=3000
   APP_URL="http://localhost:4000"
   BETTER_AUTH_SECRET="your-super-secret-jwt-key"
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   
   # Seed admin user and categories
   npx tsx src/scripts/seedAdmin.ts
   
   # Seed sample data
   npx tsx src/scripts/seedDatabase.ts
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3000`

## Production Deployment

**Live API**: `https://medi-store-backend-sigma.vercel.app`

### Deploy to Vercel
```bash
# Deploy to production
vercel --prod
```

## API Documentation

### Base URLs
- **Production**: `https://medi-store-backend-sigma.vercel.app`
- **Development**: `http://localhost:3000`

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/sign-out` - Logout user

### Authentication Header
```
Authorization: Bearer <jwt-token>
```

### Medicine Endpoints
- `GET /api/medicines` - Get all medicines (with filtering)
- `GET /api/medicines/:id` - Get medicine details

### Category Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details

### Review Endpoints
- `POST /api/reviews` - Create review
- `GET /api/reviews/medicine/:medicineId` - Get medicine reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Seller Endpoints
- `GET /api/seller/profile` - Get seller profile
- `PUT /api/seller/profile` - Update seller profile
- `GET /api/seller/medicines` - Get seller's medicines
- `POST /api/seller/medicines` - Add new medicine
- `PUT /api/seller/medicines/:id` - Update medicine
- `DELETE /api/seller/medicines/:id` - Delete medicine
- `GET /api/seller/orders` - Get seller's orders
- `PATCH /api/seller/orders/:id/status` - Update order status
- `GET /api/seller/dashboard` - Get seller dashboard stats

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id` - Update user status
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/sellers` - Get all sellers

## Authentication Flow

1. **Registration**: User registers with email/password → Account created with `emailVerified: true`
2. **Login**: User logs in → Receives JWT token (24h expiry)
3. **API Requests**: Include `Authorization: Bearer <token>` header
4. **Token Validation**: Server validates JWT and extracts user info
5. **Logout**: Invalidates session in database

## Database Schema

### Key Models

- **User**: Authentication and profile (CUSTOMER, SELLER, ADMIN roles)
- **Medicine**: Product catalog with pricing, stock, categories
- **Category**: Medicine organization
- **Order**: Customer orders with shipping details
- **OrderItem**: Individual items within orders
- **Review**: Customer reviews and ratings
- **Session**: JWT session management
- **Account**: Credential storage with hashed passwords

## Test Credentials

### Admin
- Email: `admin@medistore.com`
- Password: `admin123`

### Customer
- Email: `john.customer@email.com`
- Password: `customer123`

### Seller
- Email: `pharma.one@email.com`
- Password: `seller123`

## Security Features

- **JWT Tokens**: Secure stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access**: Customer, Seller, Admin permissions
- **Input Validation**: Request data validation with Zod
- **CORS Configuration**: Cross-origin request handling
- **Error Handling**: Secure error responses
- **Session Management**: Token expiration and invalidation

## Database Seeding

### Seed Commands
```bash
# Seed admin user and categories
npx tsx src/scripts/seedAdmin.ts

# Seed complete database
npx tsx src/scripts/seedDatabase.ts
```

### Seeded Data
- **1 Admin user**
- **5 Customer users**
- **5 Seller users**
- **8 Categories** (Pain Relief, Antibiotics, Vitamins, etc.)
- **8 Medicines** with proper stock and pricing
- **4 Orders** with different statuses
- **5 Reviews** with ratings and comments

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Environment Variables

### Development
```env
DATABASE_URL="postgresql://localhost:5432/medistore"
PORT=3000
APP_URL="http://localhost:4000"
BETTER_AUTH_SECRET="your-jwt-secret"
NODE_ENV="development"
```

### Production
```env
DATABASE_URL="your-production-database-url"
PORT=3000
APP_URL="your-frontend-url"
BETTER_AUTH_SECRET="your-production-jwt-secret"
NODE_ENV="production"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes. Feel free to use it as a learning resource.

---

**Live API**: https://medi-store-backend-sigma.vercel.app