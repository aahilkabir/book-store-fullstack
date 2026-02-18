# Online Bookshop Local Setup

## Prerequisites
- **Node.js**: Version 18 or higher is **REQUIRED**.
- **PostgreSQL**: Installed and running.

## Quick Start

### 1. Backend Setup
```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your DATABASE_URL

# Database Setup
npx prisma migrate dev --name init
npx prisma db seed

# Start Server
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Troubleshooting
- **Prisma Error**: If you see "Prisma only supports Node.js >= 16.13", you are using an old Node version.
  - Run `node -v` to check.
  - Upgrade using `nvm use 18` or download from [nodejs.org](https://nodejs.org).
