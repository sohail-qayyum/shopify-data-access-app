# Database Troubleshooting Guide

## Issue: "Failed to load dashboard data" and Empty Scopes

This happens when the database isn't properly initialized or the session data isn't being stored correctly.

## Quick Diagnosis

On your VPS, run these commands to check the database:

```bash
cd ~/shopify-data-app

# Check if database file exists
ls -la *.db

# If using PostgreSQL, connect to database
psql -U shopify_user -d shopify_data_app

# In PostgreSQL, run these queries:
SELECT * FROM "Session";
SELECT * FROM "DataScope";
SELECT * FROM "ApiKey";

# Exit PostgreSQL
\q
```

## Common Causes and Fixes

### Fix 1: Database Migrations Not Run

```bash
cd ~/shopify-data-app

# Run migrations
npm run prisma:migrate

# Restart app
pm2 restart shopify-data-app
```

### Fix 2: Reinstall the App

The OAuth callback might have failed. Reinstall the app:

1. In Shopify admin, go to **Apps**
2. Find your app and click **Delete**
3. Visit the OAuth URL again:
   ```
   https://your-ngrok-url.ngrok-free.app/auth?shop=your-store.myshopify.com
   ```
4. Click **Install app**

### Fix 3: Check Server Logs

```bash
# View recent logs
pm2 logs shopify-data-app --lines 100

# Look for errors related to:
# - Database connection
# - OAuth callback
# - Session creation
# - DataScope creation
```

### Fix 4: Verify Environment Variables

```bash
# Check .env file
cat .env | grep -E "DATABASE_URL|SHOPIFY_API_KEY|SHOPIFY_API_SECRET"

# Make sure:
# - DATABASE_URL is correct
# - SHOPIFY_API_KEY matches Partner Dashboard
# - SHOPIFY_API_SECRET matches Partner Dashboard
```

### Fix 5: Check Shopify App Scopes in Partner Dashboard

1. Go to https://partners.shopify.com
2. Select your app
3. Go to **App setup**
4. Scroll to **App scopes**
5. Make sure these are selected:
   - ✅ `read_orders`
   - ✅ `read_customers`
   - ✅ `read_products`
   - ✅ `read_inventory`
6. Click **Save**
7. Reinstall the app (it will ask for new permissions)

## Manual Database Fix

If the app installed but didn't create scopes, you can manually create them:

```bash
# Connect to PostgreSQL
psql -U shopify_user -d shopify_data_app
```

Run this SQL (replace SESSION_ID with your actual session ID from the Session table):

```sql
-- First, check if you have a session
SELECT id, shop FROM "Session";

-- Copy the session ID, then insert scopes (replace 'your-session-id' with actual ID)
INSERT INTO "DataScope" (id, "sessionId", "scopeName", enabled, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'your-session-id', 'orders', false, NOW(), NOW()),
  (gen_random_uuid(), 'your-session-id', 'customers', false, NOW(), NOW()),
  (gen_random_uuid(), 'your-session-id', 'inventory', false, NOW(), NOW());

-- Verify scopes were created
SELECT * FROM "DataScope";

-- Exit
\q
```

Then refresh the app in Shopify admin.

## Check Browser Console

1. In Shopify admin, open the app
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Look for errors (red text)
5. Common errors:
   - CORS errors → Check SHOPIFY_APP_URL in .env
   - 401/403 errors → Session not found
   - 500 errors → Check server logs

## Network Tab Debugging

1. In Developer Tools, go to **Network** tab
2. Refresh the app
3. Look for failed requests (red)
4. Click on failed requests to see:
   - Request URL
   - Response status
   - Response body (error message)

Common failed endpoints:
- `/api/scopes` → Session or database issue
- `/api/keys` → Session or database issue
- `/api/endpoint` → Session or database issue

## Complete Reset (If Nothing Works)

```bash
cd ~/shopify-data-app

# Stop the app
pm2 stop shopify-data-app

# Drop and recreate database
psql -U shopify_user -d postgres
DROP DATABASE shopify_data_app;
CREATE DATABASE shopify_data_app;
GRANT ALL PRIVILEGES ON DATABASE shopify_data_app TO shopify_user;
\q

# Run migrations
npm run prisma:migrate

# Restart app
pm2 restart shopify-data-app

# Reinstall app in Shopify
# Visit: https://your-ngrok-url.ngrok-free.app/auth?shop=your-store.myshopify.com
```

## Expected Behavior After Fix

When the app loads correctly, you should see:
1. ✅ No error banner at the top
2. ✅ Three data scopes in "Data Scope Selection":
   - 📦 Orders
   - 👥 Customers
   - 📊 Inventory
3. ✅ "API Keys" section (empty initially)
4. ✅ "API Endpoints" section showing three endpoints

## Most Likely Solution

Based on your symptoms, the most likely fix is:

**Reinstall the app:**
1. Delete the app from Shopify admin
2. Visit: `https://your-ngrok-url.ngrok-free.app/auth?shop=your-store.myshopify.com`
3. Complete the OAuth flow
4. The callback should create the session and initialize the three data scopes

If that doesn't work, check the server logs for errors during the OAuth callback.
