# Deployment Guide - Online Bookshop Platform

This guide outlines the steps to deploy the application to a Hostinger VPS (Ubuntu 20.04/22.04).

## Prerequisites
- Hostinger VPS Access (SSH).
- Domain name pointed to VPS IP.
- GitHub repository URL.

## 1. Local Build & Preparation
Ensure your `package.json` scripts are ready.
- **Client**: `npm run build` should create a `dist` folder.
- **Server**: `npm start` should run `node src/index.js`.

**Important**: In `client/.env.production` (create it if missing), set:
```
VITE_API_URL=https://your-domain.com/api
```

## 2. Server Setup (Ubuntu)

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (v18+)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install MySQL / PostgreSQL
For PostgreSQL:
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql.service
```

### Setup Database
```bash
sudo -u postgres psql
# In Postgres shell:
CREATE DATABASE bookstore;
CREATE USER admin WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE bookstore TO admin;
\q
```

### Install PM2 & Nginx
```bash
sudo npm install -g pm2
sudo apt install nginx -y
```

## 3. Application Deployment

### Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/your-repo/react-e-commerce.git bookshop
cd bookshop
```

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL, etc.
nano .env
```
Run Migrations:
```bash
npx prisma migrate deploy
```
Start Backend:
```bash
pm2 start src/index.js --name "bookshop-api"
```

### Frontend Setup
```bash
cd ../client
npm install
npm run build
```
The build output will be in `client/dist`.

## 4. Nginx Configuration

Create a new config:
```bash
sudo nano /etc/nginx/sites-available/bookshop
```

Content:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/bookshop/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable Site:
```bash
sudo ln -s /etc/nginx/sites-available/bookshop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. SSL (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 6. Verification
- Visit `https://your-domain.com` -> Should load the React App.
- Try Login/Register -> Should hit the API.
