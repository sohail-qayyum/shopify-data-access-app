# VPS Deployment Guide for Shopify Data Access App

## Overview

This guide will walk you through deploying the Shopify Data Access App on your VPS server and creating the app in Shopify Partner Dashboard. Since you don't have a domain, we'll use **ngrok** to create a secure HTTPS tunnel.

## Why ngrok?

Shopify requires HTTPS URLs for app installation. Options:
- ✅ **ngrok** - Free tier available, persistent URLs with paid plan, easy setup
- ❌ **Direct IP** - Shopify doesn't accept IP addresses
- ❌ **Self-signed SSL** - Shopify won't trust it
- ⚠️ **Cloudflare Tunnel** - Free alternative but more complex setup

**Recommendation:** Use ngrok (free tier for testing, $8/month for persistent domain)

---

## Part 1: Set Up Your VPS Server

### Step 1: Install Required Software

SSH into your VPS and run:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher

# Install PM2 (process manager to keep app running)
sudo npm install -g pm2

# Install PostgreSQL (recommended for production)
sudo apt install -y postgresql postgresql-contrib
```

### Step 2: Configure PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE shopify_data_app;
CREATE USER shopify_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE shopify_data_app TO shopify_user;
\q

# Exit PostgreSQL
```

### Step 3: Navigate to Your App Directory

```bash
cd ~/shopify-data-app  # Or wherever you cloned the repo
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Update Database Configuration

Edit `prisma/schema.prisma`:

```bash
nano prisma/schema.prisma
```

Change the datasource from SQLite to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 6: Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env
```

Fill in the following (we'll update SHOPIFY_APP_URL later):

```env
# Shopify credentials (we'll get these from Partner Dashboard later)
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_APP_URL=https://your-ngrok-url.ngrok-free.app
SHOPIFY_SCOPES=read_orders,read_customers,read_products,read_inventory

# Database (update with your PostgreSQL credentials)
DATABASE_URL="postgresql://shopify_user:your_secure_password_here@localhost:5432/shopify_data_app"

# Generate a random session secret
SESSION_SECRET=generate_random_32_byte_hex_string

# Production settings
NODE_ENV=production
PORT=3000

# Rate limiting
API_RATE_LIMIT=100
API_RATE_WINDOW_MS=900000
```

**Generate Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as SESSION_SECRET in .env

Save and exit (Ctrl+X, then Y, then Enter)

### Step 7: Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Step 8: Build the Frontend

```bash
npm run build
```

---

## Part 2: Set Up ngrok

### Step 1: Install ngrok

```bash
# Download ngrok (for Linux)
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Verify installation
ngrok version
```

### Step 2: Create ngrok Account and Get Auth Token

1. Go to https://dashboard.ngrok.com/signup
2. Sign up for a free account
3. Go to https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken

### Step 3: Configure ngrok

```bash
# Add your authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 4: Start Your App with PM2

```bash
# Start the app with PM2
pm2 start npm --name "shopify-data-app" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command it outputs
```

### Step 5: Start ngrok Tunnel

```bash
# Start ngrok in a new terminal/screen session
ngrok http 3000
```

**IMPORTANT:** Copy the HTTPS URL that ngrok provides. It will look like:
```
https://abc123def456.ngrok-free.app
```

**For Production (Recommended):**
- Upgrade to ngrok paid plan ($8/month) to get a persistent domain
- This prevents your URL from changing every time you restart ngrok
- Free tier URLs change on every restart

### Step 6: Update Environment Variables

```bash
# Stop the app
pm2 stop shopify-data-app

# Edit .env file
nano .env
```

Update `SHOPIFY_APP_URL` with your ngrok URL:
```env
SHOPIFY_APP_URL=https://abc123def456.ngrok-free.app
```

Save and restart:
```bash
pm2 restart shopify-data-app
```

---

## Part 3: Create Shopify App in Partner Dashboard

### Step 1: Access Shopify Partner Dashboard

1. Go to https://partners.shopify.com
2. Log in or create a free Partner account

### Step 2: Create a New App

1. Click **Apps** in the left sidebar
2. Click **Create app**
3. Choose **Create app manually**

### Step 3: Configure App Settings

Fill in the following:

**App name:** Data Access App (or your preferred name)

**App URL:** 
```
https://your-ngrok-url.ngrok-free.app
```

**Allowed redirection URL(s):**
```
https://your-ngrok-url.ngrok-free.app/auth/callback
```

Click **Create app**

### Step 4: Get API Credentials

1. In your app dashboard, go to **App setup**
2. Copy your **API key** (Client ID)
3. Copy your **API secret key** (Client secret)

### Step 5: Configure API Scopes

1. Scroll down to **App scopes**
2. Select the following scopes:
   - ✅ `read_orders`
   - ✅ `read_customers`
   - ✅ `read_products`
   - ✅ `read_inventory`
3. Click **Save**

### Step 6: Update Your VPS Environment

SSH back to your VPS:

```bash
# Stop the app
pm2 stop shopify-data-app

# Edit .env
nano .env
```

Update with your Shopify credentials:
```env
SHOPIFY_API_KEY=your_actual_api_key_from_shopify
SHOPIFY_API_SECRET=your_actual_api_secret_from_shopify
```

Save and restart:
```bash
pm2 restart shopify-data-app
```

---

## Part 4: Create a Development Store and Install the App

### Step 1: Create Development Store

1. In Shopify Partner Dashboard, go to **Stores**
2. Click **Add store**
3. Choose **Development store**
4. Fill in store details and create

### Step 2: Install Your App

**Method 1: From Partner Dashboard**
1. Go to your app in Partner Dashboard
2. Click **Select store**
3. Choose your development store
4. Click **Install app**

**Method 2: Direct URL**
Visit this URL in your browser:
```
https://your-ngrok-url.ngrok-free.app/auth?shop=your-store-name.myshopify.com
```

Replace `your-store-name` with your actual store name.

### Step 3: Authorize the App

1. You'll be redirected to Shopify
2. Review the permissions
3. Click **Install app**
4. You'll be redirected to your app dashboard

---

## Part 5: Configure and Test

### Step 1: Configure Data Scopes

In the app dashboard:
1. Toggle on the data scopes you want to share (Orders, Customers, Inventory)
2. Click **Save Changes**

### Step 2: Generate API Key

1. Click **Generate New Key**
2. Enter a name (e.g., "Production Dashboard")
3. Copy the generated API key

### Step 3: Test the API

```bash
# Test orders endpoint
curl -X GET "https://your-ngrok-url.ngrok-free.app/data/orders?limit=10" \
  -H "X-API-Key: your_generated_api_key"

# Test customers endpoint
curl -X GET "https://your-ngrok-url.ngrok-free.app/data/customers?limit=10" \
  -H "X-API-Key: your_generated_api_key"

# Test inventory endpoint
curl -X GET "https://your-ngrok-url.ngrok-free.app/data/inventory?limit=10" \
  -H "X-API-Key: your_generated_api_key"
```

---

## Part 6: Keep ngrok Running (Production Setup)

### Option 1: Use screen or tmux

```bash
# Install screen
sudo apt install screen

# Start a screen session
screen -S ngrok

# Start ngrok
ngrok http 3000

# Detach from screen: Press Ctrl+A, then D
# Reattach later: screen -r ngrok
```

### Option 2: Run ngrok as a Service

Create a systemd service:

```bash
sudo nano /etc/systemd/system/ngrok.service
```

Add this content:
```ini
[Unit]
Description=ngrok
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/home/your_username
ExecStart=/usr/local/bin/ngrok http 3000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ngrok
sudo systemctl start ngrok

# Check status
sudo systemctl status ngrok
```

### Option 3: Upgrade to ngrok Paid Plan (Recommended)

**Benefits:**
- Persistent domain (doesn't change on restart)
- Custom subdomain
- No "Visit Site" button on ngrok page
- Better for production

**Cost:** $8/month

**Setup:**
1. Upgrade at https://dashboard.ngrok.com/billing/plan
2. Reserve a domain in ngrok dashboard
3. Update your .env and Shopify app settings with the persistent URL

---

## Monitoring and Maintenance

### Check App Status

```bash
# View PM2 processes
pm2 list

# View app logs
pm2 logs shopify-data-app

# Restart app
pm2 restart shopify-data-app

# Stop app
pm2 stop shopify-data-app
```

### Check ngrok Status

```bash
# If using systemd
sudo systemctl status ngrok

# View ngrok web interface
# Visit http://localhost:4040 (from VPS)
# Or use SSH tunnel: ssh -L 4040:localhost:4040 user@your-vps-ip
```

### Database Backups

```bash
# Backup database
pg_dump -U shopify_user shopify_data_app > backup_$(date +%Y%m%d).sql

# Restore database
psql -U shopify_user shopify_data_app < backup_20260123.sql
```

---

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs shopify-data-app

# Common issues:
# - Database connection error: Check DATABASE_URL in .env
# - Port already in use: Change PORT in .env
# - Missing dependencies: Run npm install
```

### ngrok tunnel not working
```bash
# Check if ngrok is running
ps aux | grep ngrok

# Restart ngrok
sudo systemctl restart ngrok  # If using systemd
# Or restart screen session
```

### OAuth errors
- Verify SHOPIFY_APP_URL matches your ngrok URL exactly
- Check redirect URLs in Shopify Partner Dashboard
- Ensure ngrok tunnel is active

### Database errors
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database connection
psql -U shopify_user -d shopify_data_app -h localhost
```

---

## Security Recommendations

1. **Firewall:** Only expose port 3000 to localhost (ngrok handles external access)
   ```bash
   sudo ufw allow 22/tcp  # SSH
   sudo ufw enable
   ```

2. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm update
   ```

3. **Environment Variables:** Never commit .env to git

4. **API Keys:** Rotate API keys regularly in the dashboard

5. **Database:** Use strong passwords and regular backups

---

## Quick Reference Commands

```bash
# Start everything
pm2 start shopify-data-app
sudo systemctl start ngrok  # If using systemd

# Stop everything
pm2 stop shopify-data-app
sudo systemctl stop ngrok

# Restart app after code changes
git pull
npm install
npm run build
pm2 restart shopify-data-app

# View logs
pm2 logs shopify-data-app
sudo journalctl -u ngrok -f

# Check ngrok URL
curl http://localhost:4040/api/tunnels | jq
```

---

## Summary

You now have:
✅ App running on VPS with PM2  
✅ PostgreSQL database configured  
✅ ngrok tunnel providing HTTPS URL  
✅ Shopify app created in Partner Dashboard  
✅ App installed on development store  
✅ API endpoints accessible via generated API keys  

**Next Steps:**
1. Test all API endpoints thoroughly
2. Consider upgrading to ngrok paid plan for persistent URL
3. Set up monitoring and alerts
4. Create regular database backups
5. When ready for production, consider getting a domain and proper SSL certificate
