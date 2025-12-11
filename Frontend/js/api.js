// API Client for Mr. Sandwich
class ApiClient {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
        this.token = localStorage.getItem('token');
    }

    // Helper method to get headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // Helper method to handle API responses
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return response.json();
    }

    // Auth endpoints
    async login(email, password) {
        const response = await fetch(`${this.baseURL}/api/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password })
        });
        const data = await this.handleResponse(response);
            this.token = data.token;
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
        return data;
    }

    async register(userData) {
        const response = await fetch(`${this.baseURL}/api/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData)
        });
        const data = await this.handleResponse(response);
            this.token = data.token;
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
        return data;
    }

    async getProfile() {
        const response = await fetch(`${this.baseURL}/api/auth/profile`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Product endpoints
    async getProducts() {
        const response = await fetch(`${this.baseURL}/api/products`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getProduct(id) {
        const response = await fetch(`${this.baseURL}/api/products/${id}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Order endpoints
    async createOrder(orderData) {
        const response = await fetch(`${this.baseURL}/api/orders`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(orderData)
        });
        return this.handleResponse(response);
    }

    async getOrders() {
        const response = await fetch(`${this.baseURL}/api/orders`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getOrder(id) {
        const response = await fetch(`${this.baseURL}/api/orders/${id}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getUserOrders() {
        const response = await fetch(`${this.baseURL}/api/orders/my`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async updateOrderStatus(orderId, status) {
        const response = await fetch(`${this.baseURL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ status })
        });
        return this.handleResponse(response);
    }

    // User endpoints
    async updateProfile(userData) {
        const response = await fetch(`${this.baseURL}/api/users/profile`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(userData)
        });
        return this.handleResponse(response);
    }

    async updatePassword(passwordData) {
        const response = await fetch(`${this.baseURL}/api/users/password`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(passwordData)
        });
        return this.handleResponse(response);
    }

    // Admin endpoints
    async getAdminStats() {
        const response = await fetch(`${this.baseURL}/api/admin/stats`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getSalesByDay() {
        const response = await fetch(`${this.baseURL}/api/admin/sales-by-day`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getSalesByProduct() {
        const response = await fetch(`${this.baseURL}/api/admin/sales-by-product`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getAdminRecentOrders() {
        const response = await fetch(`${this.baseURL}/api/admin/orders`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getAdminUsers() {
        const response = await fetch(`${this.baseURL}/api/admin/users`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
}

// Create global API instance
window.api = new ApiClient();

// Backwards-compatible namespace used by other scripts (e.g. AuthManager)
window.api.auth = {
    login: (email, password) => window.api.login(email, password),
    register: (userData) => window.api.register(userData)
};

// Orders namespace for easier usage in orders.js
window.api.orders = {
    getUserOrders: () => window.api.getUserOrders(),
    create: (orderData) => window.api.createOrder(orderData),
    updateStatus: (orderId, status) => window.api.updateOrderStatus(orderId, status)
};

// Admin namespace for easier usage in admin.js
window.api.admin = {
    getStats: () => window.api.getAdminStats(),
    getRecentOrders: () => window.api.getAdminRecentOrders(),
    getUsers: () => window.api.getAdminUsers()
    ,getSalesByDay: () => window.api.getSalesByDay()
    ,getSalesByProduct: () => window.api.getSalesByProduct()
};
