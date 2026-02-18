# Online Bookshop Platform - Walkthrough

I have successfully transformed the repository into a production-ready full-stack application.

## 🏗️ Project Structure
The project is now a monorepo:
- **`client/`**: The React Frontend (Vite + TailwindCSS).
- **`server/`**: The Node.js/Express Backend (Prisma + PostgreSQL).

## 🚀 Key Features Implemented

### 1. Backend (API-First)
- **Authentication**: Secure JWT-based auth with `bcrypt` password hashing.
  - Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- **Database**: PostgreSQL schema with Prisma ORM.
  - Models: `User`, `Category`, `Book`, `Order`, `OrderItem`.
- **Order Management**:
  - Create Order (transactional).
  - Razorpay Integration (create order, verify signature).
  - Admin view all orders.
  - User view own orders.
- **Admin API**: Protected routes to manage Books and Categories.

### 2. Frontend (React)
- **Modern UI**: Integrated **Tailwind CSS** for styling.
- **State Management**: Refactored `Store` context to fetch data from the real backend.
- **Authentication**: `AuthContext` managing user session and protecting routes.
- **Payment**: **Razorpay** checkout modal integration.
- **Admin Dashboard**: New UI for Admins to:
  - Add/Delete Books.
  - View Sales/Orders.

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Razorpay Test Credentials (Key ID & Secret)

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL, RAZORPAY_KEY_ID, RAZORPAY_SECRET
npx prisma migrate dev
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 📜 Documentation
- **[Task List](task.md)**: Tracked progress of all requirements.
- **[Implementation Plan](implementation_plan.md)**: Original technical design.
- **[Deployment Guide](deployment_guide.md)**: Instructions for Hostinger VPS deployment.
