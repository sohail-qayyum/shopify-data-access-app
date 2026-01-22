# Installation Guide

## Prerequisites

Before installing the Shopify Data Access App, ensure you have:

1. **Shopify Partner Account**
   - Sign up at [partners.shopify.com](https://partners.shopify.com)
   - Free account with access to development tools

2. **Development Store** (for testing)
   - Create a development store from your Partner Dashboard
   - This is where you'll test the app before going live

3. **Node.js and npm**
   - Node.js version 18.x or higher
   - npm version 9.x or higher

4. **Database** (for production)
   - PostgreSQL recommended for production
   - SQLite works fine for development

## Step 1: Create a Shopify App

1. Log in to your [Shopify Partner Dashboard](https://partners.shopify.com)
2. Click **Apps** in the left sidebar
3. Click **Create app**
4. Choose **Create app manually**
5. Fill in the app details:
   - **App name**: Data Access App (or your preferred name)
   - **App URL**: Your app's public URL (e.g., `https://your-app.herokuapp.com`)
   - **Allowed redirection URL(s)**: 
     - `https://your-app.herokuapp.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for development)

6. Click **Create app**

## Step 2: Configure API Credentials

1. In your app's dashboard, go to **App setup**
2. Note down your:
   - **API key** (Client ID)
   - **API secret key** (Client secret)
3. Under **App scopes**, select:
   - `read_orders`
   - `read_customers`
   - `read_products`
   - `read_inventory`
4. Save your changes

## Step 3: Set Up the Application

### Clone or Download the Project

```bash
cd C:\Users\asd\.gemini\antigravity\scratch\shopify-data-access-app
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```env
   SHOPIFY_API_KEY=your_api_key_from_step_2
   SHOPIFY_API_SECRET=your_api_secret_from_step_2
   SHOPIFY_APP_URL=https://your-app-url.com
   SHOPIFY_SCOPES=read_orders,read_customers,read_products,read_inventory
   
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET=generate_a_random_string_here
   
   NODE_ENV=development
   PORT=3000
   ```

3. Generate a secure session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and use it as your `SESSION_SECRET`

### Initialize the Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will create the SQLite database and set up all necessary tables.

## Step 4: Run the Application Locally

### Development Mode

```bash
npm run dev
```

This starts both the backend server (port 3000) and frontend dev server (port 3001).

### Access the App

1. Open your browser to: `http://localhost:3000/auth?shop=your-store.myshopify.com`
2. Replace `your-store` with your development store name
3. You'll be redirected to Shopify to authorize the app
4. After authorization, you'll be redirected to the app dashboard

## Step 5: Deploy to Production

### Option A: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**
   ```bash
   heroku create your-app-name
   ```

4. **Add PostgreSQL database**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set environment variables**
   ```bash
   heroku config:set SHOPIFY_API_KEY=your_api_key
   heroku config:set SHOPIFY_API_SECRET=your_api_secret
   heroku config:set SHOPIFY_APP_URL=https://your-app-name.herokuapp.com
   heroku config:set SHOPIFY_SCOPES=read_orders,read_customers,read_products,read_inventory
   heroku config:set SESSION_SECRET=your_session_secret
   heroku config:set NODE_ENV=production
   ```

6. **Update database URL for PostgreSQL**
   - Edit `prisma/schema.prisma`
   - Change `provider = "sqlite"` to `provider = "postgresql"`

7. **Deploy the app**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

8. **Run database migrations**
   ```bash
   heroku run npm run prisma:migrate
   ```

9. **Update Shopify app settings**
   - Go to your Shopify Partner Dashboard
   - Update **App URL** to: `https://your-app-name.herokuapp.com`
   - Update **Allowed redirection URL(s)** to include: `https://your-app-name.herokuapp.com/auth/callback`

### Option B: Deploy to AWS

1. **Set up an EC2 instance** or use **AWS Elastic Beanstalk**
2. **Configure RDS** for PostgreSQL database
3. **Set environment variables** in your deployment configuration
4. **Deploy the application** using your preferred method (Docker, direct deployment, etc.)
5. **Run database migrations** on the server
6. **Update Shopify app settings** with your production URLs

## Step 6: Install the App on Your Store

1. From your Shopify Partner Dashboard, go to your app
2. Click **Select store** and choose your store
3. Click **Install app**
4. Review the permissions and click **Install**
5. You'll be redirected to the app dashboard

## Step 7: Configure Data Access

1. In the app dashboard, you'll see three data scopes:
   - Orders
   - Customers
   - Inventory

2. Toggle on the scopes you want to share

3. Click **Save Changes**

4. Click **Generate New Key** to create an API key

5. Copy the API key (you won't be able to see it again)

6. Use the displayed endpoint URLs with your API key to access the data

## Troubleshooting

### App won't install
- Verify your API credentials are correct in `.env`
- Check that redirect URLs match exactly in Shopify Partner Dashboard
- Ensure your app URL is accessible (use ngrok for local testing)

### Database errors
- Make sure you ran `npm run prisma:migrate`
- Check that `DATABASE_URL` is set correctly
- For PostgreSQL, ensure the database exists and is accessible

### API endpoints return 401
- Verify your API key is active in the dashboard
- Check that you're including the key in the `X-API-Key` header
- Ensure the data scope is enabled for the endpoint you're accessing

### Rate limiting issues
- Default limit is 100 requests per 15 minutes
- Adjust `API_RATE_LIMIT` and `API_RATE_WINDOW_MS` in `.env` if needed
- Implement caching in your application to reduce API calls

### CORS errors
- Update the CORS configuration in `server/index.js`
- Add your domain to the allowed origins

## Using ngrok for Local Development

If you want to test the OAuth flow locally:

1. **Install ngrok**
   ```bash
   # Download from https://ngrok.com/download
   ```

2. **Start your app**
   ```bash
   npm run dev
   ```

3. **Start ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Update Shopify app settings**
   - Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - Update **App URL** and **Allowed redirection URL(s)** in Partner Dashboard
   - Update `SHOPIFY_APP_URL` in your `.env` file

5. **Install the app**
   - Visit: `https://abc123.ngrok.io/auth?shop=your-store.myshopify.com`

## Next Steps

- Read the [API Documentation](API_DOCUMENTATION.md) for detailed endpoint information
- Test the API endpoints using Postman or cURL
- Integrate the API with your custom dashboard
- Monitor API usage in the app dashboard
- Set up error tracking and logging for production

## Support

For issues or questions:
- Check the console logs for error messages
- Review the Shopify API documentation
- Verify your environment variables are set correctly
- Ensure all dependencies are installed
