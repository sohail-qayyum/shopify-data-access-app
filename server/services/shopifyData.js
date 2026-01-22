import shopify from '../config/shopify.js';

/**
 * Service for fetching data from Shopify Admin API
 */
class ShopifyDataService {
    constructor(session) {
        this.session = session;
        this.client = new shopify.clients.Rest({
            session: {
                shop: session.shop,
                accessToken: session.accessToken
            }
        });
    }

    /**
     * Fetch orders with optional filters
     */
    async getOrders(filters = {}) {
        try {
            const params = {
                limit: filters.limit || 50,
                status: filters.status || 'any',
            };

            if (filters.created_at_min) {
                params.created_at_min = filters.created_at_min;
            }
            if (filters.created_at_max) {
                params.created_at_max = filters.created_at_max;
            }
            if (filters.customer_id) {
                params.customer_id = filters.customer_id;
            }

            const response = await this.client.get({
                path: 'orders',
                query: params
            });

            return this.formatOrders(response.body.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw new Error('Failed to fetch orders from Shopify');
        }
    }

    /**
     * Fetch customers with optional filters
     */
    async getCustomers(filters = {}) {
        try {
            const params = {
                limit: filters.limit || 50,
            };

            if (filters.created_at_min) {
                params.created_at_min = filters.created_at_min;
            }
            if (filters.created_at_max) {
                params.created_at_max = filters.created_at_max;
            }
            if (filters.email) {
                params.email = filters.email;
            }

            const response = await this.client.get({
                path: 'customers',
                query: params
            });

            return this.formatCustomers(response.body.customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw new Error('Failed to fetch customers from Shopify');
        }
    }

    /**
     * Fetch inventory/products with optional filters
     */
    async getInventory(filters = {}) {
        try {
            const params = {
                limit: filters.limit || 50,
            };

            if (filters.product_id) {
                params.ids = filters.product_id;
            }
            if (filters.vendor) {
                params.vendor = filters.vendor;
            }

            const response = await this.client.get({
                path: 'products',
                query: params
            });

            return this.formatInventory(response.body.products);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            throw new Error('Failed to fetch inventory from Shopify');
        }
    }

    /**
     * Format orders data for API response
     */
    formatOrders(orders) {
        return orders.map(order => ({
            id: order.id,
            order_number: order.order_number,
            customer: {
                id: order.customer?.id,
                email: order.customer?.email,
                first_name: order.customer?.first_name,
                last_name: order.customer?.last_name
            },
            line_items: order.line_items?.map(item => ({
                id: item.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                title: item.title,
                quantity: item.quantity,
                price: item.price
            })),
            total_price: order.total_price,
            currency: order.currency,
            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status,
            created_at: order.created_at,
            updated_at: order.updated_at
        }));
    }

    /**
     * Format customers data for API response
     */
    formatCustomers(customers) {
        return customers.map(customer => ({
            id: customer.id,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone: customer.phone,
            orders_count: customer.orders_count,
            total_spent: customer.total_spent,
            created_at: customer.created_at,
            updated_at: customer.updated_at,
            addresses: customer.addresses?.map(addr => ({
                address1: addr.address1,
                city: addr.city,
                province: addr.province,
                country: addr.country,
                zip: addr.zip
            }))
        }));
    }

    /**
     * Format inventory/products data for API response
     */
    formatInventory(products) {
        return products.map(product => ({
            id: product.id,
            title: product.title,
            vendor: product.vendor,
            product_type: product.product_type,
            created_at: product.created_at,
            updated_at: product.updated_at,
            variants: product.variants?.map(variant => ({
                id: variant.id,
                sku: variant.sku,
                price: variant.price,
                inventory_quantity: variant.inventory_quantity,
                inventory_item_id: variant.inventory_item_id,
                title: variant.title,
                available: variant.inventory_quantity > 0
            }))
        }));
    }
}

export default ShopifyDataService;
