# Shopify Data Access App

A comprehensive Shopify app that provides secure API access to your store's Orders, Customers, and Inventory data through customizable endpoints.

## Features

✨ **Selective Data Sharing** - Choose which data scopes (Orders, Customers, Inventory) to share  
🔐 **Secure Authentication** - OAuth 2.0 for app installation + API key authentication for endpoints  
🎯 **Flexible Filtering** - Query parameters for date ranges, customer IDs, product IDs, and more  
📊 **Clean JSON Format** - Well-structured data ready for integration with dashboards  
🚀 **Rate Limiting** - Built-in protection with configurable limits  
📝 **Comprehensive Logging** - Track API usage and monitor access patterns  
💎 **Polaris UI** - Beautiful, native Shopify admin experience  

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- Shopify Partner account
- Development store (for testing)

### Installation

1. **Clone the repository**
   ```bash
   cd C:\Users\asd\.gemini\antigravity\scratch\shopify-data-access-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   copy .env.example .env
   # Edit .env with your Shopify credentials
   ```

4. **Initialize database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the app**
   ```
   http://localhost:3000/auth?shop=your-store.myshopify.com
   ```

For detailed installation instructions, see [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md).

## Project Structure

```
shopify-data-access-app/
├── server/                    # Backend Express application
│   ├── config/               # Shopify API configuration
│   ├── middleware/           # Authentication & logging middleware
│   ├── routes/               # API route handlers
│   │   ├── auth.js          # OAuth flow
│   │   ├── api.js           # Admin dashboard API
│   │   └── data.js          # Public data endpoints
│   ├── services/             # Business logic
│   │   └── shopifyData.js   # Shopify API integration
│   └── index.js              # Server entry point
├── client/                    # Frontend React application
│   ├── components/           # Reusable UI components
│   │   ├── ScopeSelector.jsx
│   │   ├── ApiKeyManager.jsx
│   │   └── ApiEndpoint.jsx
│   ├── pages/                # Page components
│   │   └── Dashboard.jsx
│   ├── App.jsx               # Main app component
│   └── main.jsx              # React entry point
├── prisma/                    # Database schema & migrations
│   └── schema.prisma
├── API_DOCUMENTATION.md       # Complete API reference
├── INSTALLATION_GUIDE.md      # Setup instructions
└── package.json
```

## Usage

### 1. Install the App

Install the app on your Shopify store through the Shopify Partner Dashboard or by visiting the OAuth URL.

### 2. Configure Data Scopes

In the app dashboard:
- Toggle on the data scopes you want to share (Orders, Customers, Inventory)
- Click "Save Changes"

### 3. Generate API Key

- Click "Generate New Key"
- Give it a descriptive name
- Copy the generated key (shown only once)

### 4. Use the API

```bash
curl -X GET "https://your-app-url.com/data/orders?limit=50" \
  -H "X-API-Key: your_api_key_here"
```

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete endpoint documentation.

## API Endpoints

### Orders
```
GET /data/orders
```
Query parameters: `limit`, `status`, `created_at_min`, `created_at_max`, `customer_id`

### Customers
```
GET /data/customers
```
Query parameters: `limit`, `created_at_min`, `created_at_max`, `email`

### Inventory
```
GET /data/inventory
```
Query parameters: `limit`, `product_id`, `vendor`

## Development

### Run in Development Mode

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:3000`
- Frontend dev server on `http://localhost:3001`

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Deployment

### Heroku

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set SHOPIFY_API_KEY=your_key
heroku config:set SHOPIFY_API_SECRET=your_secret
# ... set other env vars
git push heroku main
heroku run npm run prisma:migrate
```

### AWS / Other Platforms

1. Set up Node.js environment
2. Configure PostgreSQL database
3. Set environment variables
4. Run `npm run build`
5. Start with `npm start`
6. Run database migrations

See [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for detailed deployment instructions.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SHOPIFY_API_KEY` | Your Shopify app API key | `abc123...` |
| `SHOPIFY_API_SECRET` | Your Shopify app secret | `def456...` |
| `SHOPIFY_APP_URL` | Your app's public URL | `https://your-app.com` |
| `SHOPIFY_SCOPES` | Required API scopes | `read_orders,read_customers,...` |
| `DATABASE_URL` | Database connection string | `postgresql://...` |
| `SESSION_SECRET` | Secret for session encryption | Random 32-byte hex string |
| `NODE_ENV` | Environment | `development` or `production` |
| `PORT` | Server port | `3000` |
| `API_RATE_LIMIT` | Max requests per window | `100` |
| `API_RATE_WINDOW_MS` | Rate limit window in ms | `900000` (15 min) |

## Security

- ✅ OAuth 2.0 authentication for app installation
- ✅ API key authentication for data endpoints
- ✅ Rate limiting to prevent abuse
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Scope-based access control
- ✅ Usage logging and monitoring

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, Vite
- **UI Framework**: Shopify Polaris
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **Authentication**: Shopify OAuth 2.0
- **API**: Shopify Admin API

## Contributing

This is a custom Shopify app. For modifications:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

## Support

For issues or questions:
- Review the [API Documentation](API_DOCUMENTATION.md)
- Check the [Installation Guide](INSTALLATION_GUIDE.md)
- Verify environment variables are set correctly
- Check server logs for error messages

## Roadmap

- [ ] Webhook support for real-time data updates
- [ ] GraphQL API option
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] Analytics dashboard
- [ ] Multi-store support
- [ ] Custom field mapping

---

Built with ❤️ for Shopify merchants who need flexible data access
