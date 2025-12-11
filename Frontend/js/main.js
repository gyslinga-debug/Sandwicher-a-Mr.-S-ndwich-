// Utilidades generales
class Utils {
    static showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Cargando...</p>
        `;
        document.body.appendChild(loading);
        return loading;
    }

    static hideLoading(loading) {
        if (loading && loading.parentNode) {
            loading.parentNode.removeChild(loading);
        }
    }

    static showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#198754' : '#dc3545'};
            color: white;
            border-radius: 8px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Sistema de notificaciones
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(notification));
        
        this.container.appendChild(notification);
        
        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }
        
        return notification;
    }

    remove(notification) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
        }, 300);
    }

    getBackgroundColor(type) {
        const colors = {
            info: '#0dcaf0',
            success: '#198754',
            warning: '#ffc107',
            error: '#dc3545'
        };
        return colors[type] || colors.info;
    }
}

// Manejo de autenticación global
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
        this.setupEventListeners();
    }

    loadUser() {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            } catch (error) {
                this.logout();
            }
        }
    }

    async login(email, password) {
        try {
            const response = await api.auth.login(email, password);
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            this.currentUser = response.user;
            this.updateUI();
            
            Utils.showToast('¡Bienvenido!', 'success');
            return { success: true, user: response.user };
        } catch (error) {
            Utils.showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    async register(userData) {
        try {
            const response = await api.auth.register(userData);
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            this.currentUser = response.user;
            this.updateUI();
            
            Utils.showToast('¡Registro exitoso!', 'success');
            return { success: true, user: response.user };
        } catch (error) {
            Utils.showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        
        this.currentUser = null;
        this.updateUI();
        
        window.location.href = 'B01_Inicio_Sesion.html';
    }

    updateUI() {
        const userMenu = document.getElementById('userMenu');
        const authButtons = document.getElementById('authButtons');
        const userName = document.getElementById('userName');
        
        if (userMenu && authButtons && userName) {
            if (this.currentUser) {
                userMenu.style.display = 'block';
                authButtons.style.display = 'none';
                userName.textContent = this.currentUser.name;
                
                // Actualizar enlaces del menú de usuario
                const profileLink = userMenu.querySelector('a[href*="Perfil"]');
                if (profileLink) {
                    profileLink.href = 'B04_Perfil_Usuario.html';
                }
                
                const ordersLink = userMenu.querySelector('a[href*="Historial"]');
                if (ordersLink) {
                    ordersLink.href = 'B06_Historial_Pedidos.html';
                }
            } else {
                userMenu.style.display = 'none';
                authButtons.style.display = 'flex';
            }
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getUser() {
        return this.currentUser;
    }

    setupEventListeners() {
        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }
}

// Sistema de carrito global
class CartManager {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                this.items = JSON.parse(savedCart);
            } catch (error) {
                this.items = [];
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    addItem(product, quantity = 1) {
        const prodId = product._id ?? product.id;
        const existingItem = this.items.find(item => String(item.id) === String(prodId));

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: prodId,
                _id: product._id ?? null,
                name: product.name ?? product.title ?? 'Producto',
                price: product.price ?? product.cost ?? 0,
                quantity: quantity,
                image: product.imageUrl ?? product.image ?? ''
            });
        }
        
        this.saveCart();
        Utils.showToast('Producto agregado al carrito', 'success');
    }

    removeItem(productId) {
        // Compare IDs as strings to avoid type mismatch (number vs string)
        const pidStr = String(productId);
        this.items = this.items.filter(item => String(item.id) !== pidStr);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        // Find item using string comparison to tolerate number/string IDs
        const pidStr = String(productId);
        const item = this.items.find(item => String(item.id) === pidStr);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(pidStr);
            } else {
                this.saveCart();
            }
        }
    }

    clearCart() {
        this.items = [];
        localStorage.removeItem('cart');
        this.updateCartCount();
    }

    getItems() {
        return this.items;
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const count = this.getItemCount();
        
        cartCounts.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline' : 'none';
        });
    }
}

// Inicializar sistemas globales
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistemas
    window.notifications = new NotificationSystem();
    window.auth = new AuthManager();
    window.cart = new CartManager();
    
    // La inicialización del catálogo ahora se maneja en B07_Catalogo.html
    
    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Inicializar popovers de Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    
    // Manejar formularios con validación
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
    
    // Actualizar año en footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Efectos de animación
    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    });
});