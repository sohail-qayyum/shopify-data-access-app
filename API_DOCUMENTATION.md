# API Documentation

## Overview

The Shopify Data Access App provides secure RESTful API endpoints to access your store's Orders, Customers, and Inventory data. All endpoints require authentication via API key and respect the data scope permissions configured in the app dashboard.

## Base URL

```
Production: https://your-app-url.com
Development: http://localhost:3000
```

## Authentication

All API requests must include an API key in the request headers:

```
X-API-Key: your_api_key_here
```

Alternatively, you can pass the API key as a query parameter:

```
?api_key=your_api_key_here
```

### Generating API Keys

1. Log in to your Shopify admin
2. Navigate to Apps > Data Access App
3. Click "Generate New Key"
4. Give your key a descriptive name
5. Copy the generated key (you won't be able to see it again)

## Rate Limiting

- **Limit**: 100 requests per 15-minute window per API key
- **Response**: When rate limit is exceeded, you'll receive a `429 Too Many Requests` response

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Endpoints

### 1. Orders Endpoint

**GET** `/data/orders`

Retrieve order data from your Shopify store.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `limit` | integer | Number of orders to return (max 250) | `50` |
| `status` | string | Filter by order status: `any`, `open`, `closed`, `cancelled` | `open` |
| `created_at_min` | string | Filter orders created after this date (ISO 8601) | `2024-01-01T00:00:00Z` |
| `created_at_max` | string | Filter orders created before this date (ISO 8601) | `2024-12-31T23:59:59Z` |
| `customer_id` | integer | Filter by customer ID | `123456789` |

#### Example Request

```bash
curl -X GET "https://your-app-url.com/data/orders?limit=10&status=open" \
  -H "X-API-Key: your_api_key_here"
```

#### Example Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 123456789,
      "order_number": 1001,
      "customer": {
        "id": 987654321,
        "email": "customer@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "line_items": [
        {
          "id": 111222333,
          "product_id": 444555666,
          "variant_id": 777888999,
          "title": "Product Name",
          "quantity": 2,
          "price": "29.99"
        }
      ],
      "total_price": "59.98",
      "currency": "USD",
      "financial_status": "paid",
      "fulfillment_status": "fulfilled",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T14:20:00Z"
    }
  ]
}
```

---

### 2. Customers Endpoint

**GET** `/data/customers`

Retrieve customer data from your Shopify store.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `limit` | integer | Number of customers to return (max 250) | `50` |
| `created_at_min` | string | Filter customers created after this date (ISO 8601) | `2024-01-01T00:00:00Z` |
| `created_at_max` | string | Filter customers created before this date (ISO 8601) | `2024-12-31T23:59:59Z` |
| `email` | string | Filter by email address | `customer@example.com` |

#### Example Request

```bash
curl -X GET "https://your-app-url.com/data/customers?limit=10" \
  -H "X-API-Key: your_api_key_here"
```

#### Example Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 987654321,
      "email": "customer@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "orders_count": 5,
      "total_spent": "299.95",
      "created_at": "2023-06-15T09:00:00Z",
      "updated_at": "2024-01-15T14:20:00Z",
      "addresses": [
        {
          "address1": "123 Main St",
          "city": "New York",
          "province": "NY",
          "country": "United States",
          "zip": "10001"
        }
      ]
    }
  ]
}
```

---

### 3. Inventory Endpoint

**GET** `/data/inventory`

Retrieve product and inventory data from your Shopify store.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `limit` | integer | Number of products to return (max 250) | `50` |
| `product_id` | integer | Filter by product ID | `123456789` |
| `vendor` | string | Filter by vendor name | `YourBrand` |

#### Example Request

```bash
curl -X GET "https://your-app-url.com/data/inventory?limit=10" \
  -H "X-API-Key: your_api_key_here"
```

#### Example Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 444555666,
      "title": "Premium T-Shirt",
      "vendor": "YourBrand",
      "product_type": "Apparel",
      "created_at": "2023-01-10T12:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "variants": [
        {
          "id": 777888999,
          "sku": "TSHIRT-BLK-M",
          "price": "29.99",
          "inventory_quantity": 150,
          "inventory_item_id": 111222333,
          "title": "Black / Medium",
          "available": true
        },
        {
          "id": 777888998,
          "sku": "TSHIRT-BLK-L",
          "price": "29.99",
          "inventory_quantity": 0,
          "inventory_item_id": 111222334,
          "title": "Black / Large",
          "available": false
        }
      ]
    }
  ]
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Data scope not enabled |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

## Best Practices

1. **Cache responses** when possible to reduce API calls
2. **Use appropriate limits** - don't request more data than you need
3. **Handle rate limits** - implement exponential backoff when you receive 429 responses
4. **Secure your API keys** - never expose them in client-side code or public repositories
5. **Use date filters** to fetch only recent data for better performance
6. **Monitor usage** - check the "Last Used" column in the API Keys dashboard

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const apiKey = 'your_api_key_here';
const baseUrl = 'https://your-app-url.com';

async function getOrders() {
  try {
    const response = await axios.get(`${baseUrl}/data/orders`, {
      headers: {
        'X-API-Key': apiKey
      },
      params: {
        limit: 50,
        status: 'open'
      }
    });
    
    console.log('Orders:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

getOrders();
```

### Python

```python
import requests

api_key = 'your_api_key_here'
base_url = 'https://your-app-url.com'

headers = {
    'X-API-Key': api_key
}

params = {
    'limit': 50,
    'status': 'open'
}

response = requests.get(f'{base_url}/data/orders', headers=headers, params=params)

if response.status_code == 200:
    data = response.json()
    print('Orders:', data)
else:
    print('Error:', response.json())
```

### cURL

```bash
# Get orders
curl -X GET "https://your-app-url.com/data/orders?limit=50&status=open" \
  -H "X-API-Key: your_api_key_here"

# Get customers
curl -X GET "https://your-app-url.com/data/customers?limit=50" \
  -H "X-API-Key: your_api_key_here"

# Get inventory
curl -X GET "https://your-app-url.com/data/inventory?limit=50" \
  -H "X-API-Key: your_api_key_here"
```

## Support

For issues or questions:
- Check the app dashboard for endpoint status
- Verify your API key is active
- Ensure the required data scopes are enabled
- Review error messages for specific guidance
