# Shopify Embedding Fix Guide

## Issue: "refused to connect" Error

When you see this error in Shopify admin, it means the app is being blocked from loading in an iframe.

## Quick Fixes

### Fix 1: Update Server Configuration (REQUIRED)

The server code has been updated to allow Shopify iframe embedding. You need to pull the changes and restart:

```bash
# On your VPS
cd ~/shopify-data-app
git pull
pm2 restart shopify-data-app
```

### Fix 2: Handle ngrok Free Tier Interstitial Page

The ngrok free tier shows a "Visit Site" button that breaks iframe embedding.

**Option A - Skip ngrok warning (Try this first):**

Add this to your ngrok configuration:

```bash
# Edit ngrok config
nano ~/.config/ngrok/ngrok.yml
```

Add these lines:
```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  shopify-app:
    proto: http
    addr: 3000
    inspect: false
```

Then start ngrok with:
```bash
ngrok start shopify-app
```

**Option B - Upgrade ngrok (Recommended for production):**
- Go to https://dashboard.ngrok.com/billing/plan
- Upgrade to paid plan ($8/month)
- This removes the interstitial page completely
- Gives you a persistent URL

### Fix 3: Update Shopify App Settings

Make sure your Shopify app configuration is correct:

1. Go to https://partners.shopify.com
2. Select your app
3. Go to **App setup**
4. Verify these URLs:
   - **App URL**: `https://your-ngrok-url.ngrok-free.app`
   - **Allowed redirection URL(s)**: `https://your-ngrok-url.ngrok-free.app/auth/callback`
5. Make sure **Embedded app** is checked

### Fix 4: Clear Browser Cache

Sometimes Shopify caches the error:

1. In Shopify admin, open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or try in an incognito/private window

## Testing Steps

After applying the fixes:

1. **Restart your app:**
   ```bash
   pm2 restart shopify-data-app
   ```

2. **Check app is running:**
   ```bash
   pm2 logs shopify-data-app
   curl http://localhost:3000/health
   ```

3. **Verify ngrok tunnel:**
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

4. **Test the app URL directly in browser:**
   - Visit: `https://your-ngrok-url.ngrok-free.app`
   - You should see "Loading..." or the app dashboard

5. **Reinstall the app:**
   - Visit: `https://your-ngrok-url.ngrok-free.app/auth?shop=your-store.myshopify.com`
   - Complete OAuth flow
   - Check if it loads in Shopify admin

## Common Issues and Solutions

### Issue: Still seeing "refused to connect"

**Solution 1:** Check if ngrok is showing the interstitial page
- Visit your ngrok URL directly in browser
- If you see "Visit Site" button, you need to upgrade ngrok or use the config fix above

**Solution 2:** Check server logs
```bash
pm2 logs shopify-data-app --lines 50
```
Look for errors related to CORS or headers

**Solution 3:** Verify environment variables
```bash
cat .env | grep SHOPIFY_APP_URL
```
Make sure it matches your ngrok URL exactly

### Issue: "Loading..." never finishes

**Solution:** Check browser console (F12) for errors
- Look for CORS errors
- Look for CSP (Content Security Policy) errors
- Check if session is being created

### Issue: ngrok URL keeps changing

**Solution:** Upgrade to ngrok paid plan for persistent URL
- Free tier URLs change on every restart
- Paid tier gives you a permanent subdomain

## Verification Checklist

- [ ] Pulled latest code with `git pull`
- [ ] Restarted app with `pm2 restart shopify-data-app`
- [ ] Verified app is running: `pm2 list`
- [ ] Checked ngrok tunnel is active
- [ ] Verified SHOPIFY_APP_URL in .env matches ngrok URL
- [ ] Confirmed app settings in Partner Dashboard are correct
- [ ] Tested app URL directly in browser
- [ ] Cleared browser cache
- [ ] Tried reinstalling the app

## If Nothing Works

Try this complete reset:

```bash
# On VPS
cd ~/shopify-data-app

# Pull latest code
git pull

# Restart everything
pm2 restart shopify-data-app

# Check ngrok URL
curl http://localhost:4040/api/tunnels | grep public_url

# Update .env with correct ngrok URL
nano .env
# Update SHOPIFY_APP_URL

# Restart again
pm2 restart shopify-data-app
```

Then in Shopify Partner Dashboard:
1. Update App URL and Redirect URL with new ngrok URL
2. Save changes
3. Reinstall app: `https://your-ngrok-url.ngrok-free.app/auth?shop=your-store.myshopify.com`

## Need More Help?

Check these logs:
```bash
# App logs
pm2 logs shopify-data-app

# ngrok logs (if using systemd)
sudo journalctl -u ngrok -f

# Check what's running
pm2 list
ps aux | grep ngrok
```

The most common cause is the ngrok free tier interstitial page. Upgrading to paid plan ($8/month) solves this permanently.
