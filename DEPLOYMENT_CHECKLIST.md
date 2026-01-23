# Quick Deployment Checklist

Use this checklist alongside the [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md) for step-by-step deployment.

## Pre-Deployment (On VPS)

- [ ] SSH into your VPS
- [ ] Navigate to `~/shopify-data-app`
- [ ] Verify Node.js is installed: `node --version` (should be v18+)
- [ ] Verify npm is installed: `npm --version`
- [ ] Install dependencies: `npm install`

## Database Setup

- [ ] Install PostgreSQL: `sudo apt install postgresql postgresql-contrib`
- [ ] Create database: `shopify_data_app`
- [ ] Create user with password
- [ ] Update `prisma/schema.prisma` to use PostgreSQL
- [ ] Update `DATABASE_URL` in `.env`
- [ ] Run migrations: `npm run prisma:migrate`

## Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Generate session secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Update `SESSION_SECRET` in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT=3000`
- [ ] Leave `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` empty for now
- [ ] Leave `SHOPIFY_APP_URL` empty for now

## Build Application

- [ ] Build frontend: `npm run build`
- [ ] Install PM2: `sudo npm install -g pm2`
- [ ] Start app with PM2: `pm2 start npm --name "shopify-data-app" -- start`
- [ ] Save PM2 config: `pm2 save`
- [ ] Setup PM2 startup: `pm2 startup` (follow the command it outputs)

## ngrok Setup

- [ ] Install ngrok (see guide for commands)
- [ ] Sign up at https://dashboard.ngrok.com/signup
- [ ] Get authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
- [ ] Configure ngrok: `ngrok config add-authtoken YOUR_TOKEN`
- [ ] Start ngrok: `ngrok http 3000`
- [ ] **COPY THE HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

## Update Environment with ngrok URL

- [ ] Stop app: `pm2 stop shopify-data-app`
- [ ] Edit `.env`: `nano .env`
- [ ] Update `SHOPIFY_APP_URL` with your ngrok URL
- [ ] Save and restart: `pm2 restart shopify-data-app`

## Shopify Partner Dashboard

- [ ] Go to https://partners.shopify.com
- [ ] Create/login to Partner account
- [ ] Click **Apps** → **Create app** → **Create app manually**
- [ ] Enter app name: "Data Access App"
- [ ] Enter App URL: `https://your-ngrok-url.ngrok-free.app`
- [ ] Enter Redirect URL: `https://your-ngrok-url.ngrok-free.app/auth/callback`
- [ ] Click **Create app**
- [ ] **COPY API key and API secret**

## Configure API Scopes

- [ ] In app settings, go to **App scopes**
- [ ] Select: `read_orders`
- [ ] Select: `read_customers`
- [ ] Select: `read_products`
- [ ] Select: `read_inventory`
- [ ] Click **Save**

## Update VPS with Shopify Credentials

- [ ] Stop app: `pm2 stop shopify-data-app`
- [ ] Edit `.env`: `nano .env`
- [ ] Update `SHOPIFY_API_KEY` with your API key
- [ ] Update `SHOPIFY_API_SECRET` with your API secret
- [ ] Save and restart: `pm2 restart shopify-data-app`

## Create Development Store

- [ ] In Partner Dashboard, go to **Stores**
- [ ] Click **Add store** → **Development store**
- [ ] Fill in store details and create
- [ ] **NOTE YOUR STORE NAME** (e.g., `my-test-store.myshopify.com`)

## Install App on Store

- [ ] Visit: `https://your-ngrok-url.ngrok-free.app/auth?shop=your-store-name.myshopify.com`
- [ ] Click **Install app** on Shopify authorization page
- [ ] You should be redirected to the app dashboard

## Configure App

- [ ] In app dashboard, toggle on desired data scopes (Orders, Customers, Inventory)
- [ ] Click **Save Changes**
- [ ] Click **Generate New Key**
- [ ] Enter key name (e.g., "Production Dashboard")
- [ ] **COPY THE API KEY** (shown only once!)

## Test API Endpoints

Test with curl or Postman:

```bash
# Orders
curl -X GET "https://your-ngrok-url.ngrok-free.app/data/orders?limit=10" \
  -H "X-API-Key: your_api_key"

# Customers
curl -X GET "https://your-ngrok-url.ngrok-free.app/data/customers?limit=10" \
  -H "X-API-Key: your_api_key"

# Inventory
curl -X GET "https://your-ngrok-url.ngrok-free.app/data/inventory?limit=10" \
  -H "X-API-Key: your_api_key"
```

- [ ] Test orders endpoint
- [ ] Test customers endpoint
- [ ] Test inventory endpoint
- [ ] Verify JSON responses are correct

## Production Setup (Optional but Recommended)

- [ ] Set up ngrok as systemd service (see guide)
- [ ] OR use screen/tmux to keep ngrok running
- [ ] Consider upgrading to ngrok paid plan ($8/month) for persistent URL
- [ ] Set up database backups
- [ ] Configure firewall: `sudo ufw allow 22/tcp && sudo ufw enable`

## Monitoring

- [ ] Check app status: `pm2 list`
- [ ] View logs: `pm2 logs shopify-data-app`
- [ ] Check ngrok status: `sudo systemctl status ngrok` (if using systemd)

---

## Quick Commands Reference

```bash
# Restart everything after changes
git pull
npm install
npm run build
pm2 restart shopify-data-app

# View logs
pm2 logs shopify-data-app

# Check ngrok URL
curl http://localhost:4040/api/tunnels

# Database backup
pg_dump -U shopify_user shopify_data_app > backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting

**App won't start:**
- Check logs: `pm2 logs shopify-data-app`
- Verify database connection in `.env`

**ngrok not working:**
- Check if running: `ps aux | grep ngrok`
- Restart: `sudo systemctl restart ngrok`

**OAuth errors:**
- Verify `SHOPIFY_APP_URL` matches ngrok URL exactly
- Check redirect URLs in Partner Dashboard

**API returns 401:**
- Verify API key is active in dashboard
- Check `X-API-Key` header is included

**API returns 403:**
- Verify data scope is enabled in dashboard

---

## Success Criteria

✅ App running on VPS with PM2  
✅ ngrok tunnel active with HTTPS URL  
✅ Shopify app created in Partner Dashboard  
✅ App installed on development store  
✅ All three data scopes configurable  
✅ API keys can be generated  
✅ All three endpoints return data  

**You're done! Your Shopify app is now live and accessible.**
