// Manejo de productos y catálogo
class ProductManager {
    constructor() {
        this.products = [];
        this.currentProduct = null;
        this.filters = {
            category: 'all',
            priceRange: 'all',
            search: '',
            sort: 'name'
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProducts();
    }

    bindEvents() {
        // Filtros de búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        // Filtro de categoría
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }

        // Filtro de precio
        const priceFilter = document.getElementById('priceFilter');
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                this.filters.priceRange = e.target.value;
                this.applyFilters();
            });
        }

        // Ordenar
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filters.sort = e.target.value;
                this.applyFilters();
            });
        }

        // Botón de aplicar filtros
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        // Botones de agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const productId = button.dataset.productId;
                this.handleAddToCart(productId);
            }
        });
    }

    async loadProducts() {
        const loading = Utils.showLoading();
        
        try {
            const response = await api.getProducts();
            this.products = response.data || response;
            
            if (window.location.pathname.includes('B07_Catalogo')) {
                this.renderProducts();
            }
            
            if (window.location.pathname.includes('B09_Detalle_Producto')) {
                this.loadProductDetail();
            }
            
        } catch (error) {
            Utils.showToast('Error al cargar productos', 'error');
            console.error('Error loading products:', error);
        } finally {
            Utils.hideLoading(loading);
        }
    }

    async loadProductDetail() {
        const productId = new URLSearchParams(window.location.search).get('id');
        
        if (!productId) {
            Utils.showToast('Producto no encontrado', 'error');
            window.location.href = 'B07_Catalogo.html';
            return;
        }
        
        const loading = Utils.showLoading();
        
        try {
            const response = await api.getProduct(productId);
            this.currentProduct = response.data || response;
            this.renderProductDetail();
        } catch (error) {
            Utils.showToast('Error al cargar el producto', 'error');
            console.error('Error loading product detail:', error);
        } finally {
            Utils.hideLoading(loading);
        }
    }

    renderProducts() {
        const container = document.getElementById('productsContainer');
        if (!container) return;
        
        const filteredProducts = this.getFilteredProducts();
        
        if (filteredProducts.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>No se encontraron productos</h4>
                    <p class="text-muted">Intenta con otros filtros de búsqueda</p>
                </div>
            `;
            return;
        }
        
        const productsHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
        container.innerHTML = productsHTML;
        
        // Actualizar contador de resultados
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`;
        }
    }

    createProductCard(product) {
        const price = product.finalPrice || product.price;
        const hasDiscount = product.discount > 0;
        
        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card product-card h-100">
                    ${hasDiscount ? `
                        <div class="product-badge">${product.discount}% OFF</div>
                    ` : ''}
                    
                    <div class="product-image">
                        <img src="${product.imageUrl || 'assets/images/placeholder.jpg'}" 
                             alt="${product.name}"
                             onerror="this.src='assets/images/placeholder.jpg'">
                    </div>
                    
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title product-title">${product.name}</h5>
                        
                        <p class="card-text text-muted flex-grow-1">
                            ${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}
                        </p>
                        
                        <div class="mt-auto">
                            <div class="product-price mb-3">
                                <span class="current-price">${Utils.formatCurrency(price)}</span>
                                ${hasDiscount ? `
                                    <span class="original-price text-muted text-decoration-line-through">
                                        ${Utils.formatCurrency(product.price)}
                                    </span>
                                ` : ''}
                            </div>
                            
                            <div class="product-actions">
                                <button class="btn btn-primary btn-sm add-to-cart" 
                                        data-product-id="${product._id || product.id}">
                                    <i class="fas fa-shopping-cart me-1"></i>
                                    Agregar
                                </button>
                                
                                <a href="B09_Detalle_Producto.html?id=${product._id || product.id}" 
                                   class="btn btn-outline-secondary btn-sm">
                                    Ver
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderProductDetail() {
        if (!this.currentProduct) return;
        
        const product = this.currentProduct;
        const price = product.finalPrice || product.price;
        const hasDiscount = product.discount > 0;
        
        // Actualizar página
        document.title = `${product.name} | Mr. Sandwich`;
        
        // Actualizar contenido
        const container = document.getElementById('productDetail');
        if (container) {
            container.innerHTML = `
                <div class="row">
                    <div class="col-lg-6">
                        <div class="product-gallery">
                            <div class="main-image mb-3">
                                <img src="${product.imageUrl || 'assets/images/placeholder.jpg'}" 
                                     alt="${product.name}"
                                     class="img-fluid rounded"
                                     onerror="this.src='assets/images/placeholder.jpg'">
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-6">
                        <div class="product-info">
                            <h1 class="mb-2">${product.name}</h1>
                            
                            <div class="product-rating mb-3">
                                <div class="stars">
                                    <i class="fas fa-star text-warning"></i>
                                    <i class="fas fa-star text-warning"></i>
                                    <i class="fas fa-star text-warning"></i>
                                    <i class="fas fa-star text-warning"></i>
                                    <i class="fas fa-star-half-alt text-warning"></i>
                                </div>
                                <span class="rating-count">(24 reseñas)</span>
                            </div>
                            
                            <div class="product-price-detail mb-4">
                                ${Utils.formatCurrency(price)}
                                ${hasDiscount ? `
                                    <span class="text-danger fs-6">
                                        <del>${Utils.formatCurrency(product.price)}</del>
                                        <span class="badge bg-danger ms-2">${product.discount}% OFF</span>
                                    </span>
                                ` : ''}
                            </div>
                            
                            <div class="product-attributes mb-4">
                                <div class="attribute">
                                    <div class="attribute-label">Descripción</div>
                                    <div class="attribute-value">${product.description}</div>
                                </div>
                                
                                ${product.ingredients && product.ingredients.length > 0 ? `
                                    <div class="attribute">
                                        <div class="attribute-label">Ingredientes</div>
                                        <div class="attribute-value">
                                            ${product.ingredients.map(ing => `<span class="badge bg-light text-dark me-1">${ing}</span>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="attribute">
                                    <div class="attribute-label">Categoría</div>
                                    <div class="attribute-value">
                                        <span class="badge bg-primary">${this.getCategoryName(product.category)}</span>
                                    </div>
                                </div>
                                
                                ${product.stock !== undefined ? `
                                    <div class="attribute">
                                        <div class="attribute-label">Disponibilidad</div>
                                        <div class="attribute-value">
                                            <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">
                                                ${product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                                            </span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="quantity-selector mb-4">
                                <label class="form-label me-3">Cantidad:</label>
                                <div class="input-group" style="width: 150px;">
                                    <button class="btn btn-outline-secondary quantity-minus" type="button">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <input type="number" 
                                           class="form-control text-center quantity-input" 
                                           value="1" 
                                           min="1"
                                           ${product.stock > 0 ? `max="${product.stock}"` : 'disabled'}>
                                    <button class="btn btn-outline-secondary quantity-plus" type="button">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="product-actions-detail">
                                <button class="btn btn-primary btn-lg add-to-cart-detail"
                                        data-product-id="${product._id || product.id}"
                                        ${product.stock === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-shopping-cart me-2"></i>
                                    Agregar al Carrito
                                </button>
                                
                                <button class="btn btn-outline-primary btn-lg"
                                        ${product.stock === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-bolt me-2"></i>
                                    Comprar Ahora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Bindear eventos de cantidad
            this.bindQuantityEvents();
            
            // Bindear evento de agregar al carrito
            const addToCartBtn = container.querySelector('.add-to-cart-detail');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    const quantity = parseInt(container.querySelector('.quantity-input').value);
                    this.handleAddToCart(product._id || product.id, quantity);
                });
            }
        }
    }

    getFilteredProducts() {
        let filtered = [...this.products];
        
        // Filtrar por búsqueda
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filtrar por categoría
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(product => product.category === this.filters.category);
        }
        
        // Filtrar por rango de precio
        if (this.filters.priceRange !== 'all') {
            const [min, max] = this.filters.priceRange.split('-').map(Number);
            filtered = filtered.filter(product => {
                const price = product.finalPrice || product.price;
                return price >= min && price <= max;
            });
        }
        
        // Ordenar
        filtered.sort((a, b) => {
            const priceA = a.finalPrice || a.price;
            const priceB = b.finalPrice || b.price;
            
            switch (this.filters.sort) {
                case 'price_asc':
                    return priceA - priceB;
                case 'price_desc':
                    return priceB - priceA;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }

    applyFilters() {
        this.renderProducts();
    }

    bindQuantityEvents() {
        const minusBtn = document.querySelector('.quantity-minus');
        const plusBtn = document.querySelector('.quantity-plus');
        const quantityInput = document.querySelector('.quantity-input');
        
        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    quantityInput.value = value - 1;
                }
            });
            
            plusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                const max = parseInt(quantityInput.max) || 99;
                if (value < max) {
                    quantityInput.value = value + 1;
                }
            });
            
            quantityInput.addEventListener('change', () => {
                let value = parseInt(quantityInput.value);
                const min = parseInt(quantityInput.min) || 1;
                const max = parseInt(quantityInput.max) || 99;
                
                if (isNaN(value) || value < min) {
                    quantityInput.value = min;
                } else if (value > max) {
                    quantityInput.value = max;
                }
            });
        }
    }

    async handleAddToCart(productId, quantity = 1) {
        if (!auth.isAuthenticated()) {
            Utils.showToast('Por favor inicia sesión para agregar productos al carrito', 'warning');
            setTimeout(() => {
                window.location.href = `B01_Inicio_Sesion.html?return=${encodeURIComponent(window.location.href)}`;
            }, 1500);
            return;
        }
        
        try {
            // Obtener detalles del producto (comparar IDs como strings para evitar mismatch)
            let product = this.products.find(p => String(p._id) === String(productId) || String(p.id) === String(productId));
            
            if (!product) {
                const response = await api.getProduct(productId);
                product = response.data || response;
            }
            
            // Agregar al carrito
            cart.addItem(product, quantity);
            
        } catch (error) {
            Utils.showToast('Error al agregar producto al carrito', 'error');
            console.error('Error adding to cart:', error);
        }
    }

    getCategoryName(category) {
        const categories = {
            'sandwich': 'Sándwiches',
            'bebida': 'Bebidas',
            'acompanamiento': 'Acompañamientos',
            'postre': 'Postres'
        };
        return categories[category] || category;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('B07_') || 
        window.location.pathname.includes('B08_') || 
        window.location.pathname.includes('B09_')) {
        window.productManager = new ProductManager();
    }
});