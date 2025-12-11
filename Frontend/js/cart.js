// Manejo del carrito de compras
class CartHandler {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCart();
    }

    bindEvents() {
        // Actualizar cantidades
        document.addEventListener('input', Utils.debounce((e) => {
            if (e.target.classList.contains('cart-quantity')) {
                const productId = e.target.dataset.productId;
                const quantity = parseInt(e.target.value);
                
                if (!isNaN(quantity) && quantity > 0) {
                    cart.updateQuantity(productId, quantity);
                    this.updateCartItem(productId);
                    this.updateTotals();
                }
            }
        }, 500));

        // Eliminar productos
        document.addEventListener('click', (e) => {
            // Quantity plus
            const plusBtn = e.target.closest('.quantity-plus');
            if (plusBtn) {
                const pid = plusBtn.dataset.productId;
                const item = cart.getItems().find(i => String(i.id) === String(pid));
                if (item) {
                    cart.updateQuantity(pid, item.quantity + 1);
                    this.updateCartItem(pid);
                    this.updateTotals();
                }
                return;
            }

            // Quantity minus
            const minusBtn = e.target.closest('.quantity-minus');
            if (minusBtn) {
                const pid = minusBtn.dataset.productId;
                const item = cart.getItems().find(i => String(i.id) === String(pid));
                if (item) {
                    const newQ = item.quantity - 1;
                    if (newQ <= 0) {
                        cart.removeItem(pid);
                        this.renderCart();
                    } else {
                        cart.updateQuantity(pid, newQ);
                        this.updateCartItem(pid);
                        this.updateTotals();
                    }
                }
                return;
            }

            // Remove item
            if (e.target.closest('.remove-item')) {
                const button = e.target.closest('.remove-item');
                const productId = button.dataset.productId;
                cart.removeItem(productId);
                this.renderCart();
            }
        });

        // Vaciar carrito
        const clearCartBtn = document.getElementById('clearCart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                    cart.clearCart();
                    this.renderCart();
                }
            });
        }

        // Continuar comprando
        const continueShoppingBtn = document.getElementById('continueShopping');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                window.location.href = 'B07_Catalogo.html';
            });
        }

        // Proceder al pago
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (!auth.isAuthenticated()) {
                    Utils.showToast('Por favor inicia sesión para continuar', 'warning');
                    window.location.href = 'B01_Inicio_Sesion.html?return=B10_Carrito_de_Compras.html';
                    return;
                }
                
                if (cart.getItems().length === 0) {
                    Utils.showToast('El carrito está vacío', 'warning');
                    return;
                }
                
                window.location.href = 'B11_Checkout.html';
            });
        }
    }

    renderCart() {
        const items = cart.getItems();

        if (window.location.pathname.includes('B10_Carrito_de_Compras')) {
            this.renderCartPage(items);
        }

        // Renderizar resumen y botón en checkout
        if (window.location.pathname.includes('B11_Checkout')) {
            this.renderCheckoutSummary(items);
        }
    }

    renderCartPage(items) {
        const container = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const cartTable = document.getElementById('cartTable');
        const cartTotals = document.getElementById('cartTotals');
        
        if (items.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartTable) cartTable.style.display = 'none';
            if (cartTotals) cartTotals.style.display = 'none';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartTable) cartTable.style.display = 'block';
        if (cartTotals) cartTotals.style.display = 'block';
        
        // Renderizar items
        if (container) {
            const itemsHTML = items.map(item => this.createCartItemRow(item)).join('');
            container.innerHTML = itemsHTML;
        }
        
        // Actualizar totales
        this.updateTotals();
    }

    createCartItemRow(item) {
        const subtotal = item.price * item.quantity;
        
        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.image || 'assets/images/placeholder.jpg'}" 
                             alt="${item.name}"
                             class="img-thumbnail me-3"
                             style="width: 80px; height: 80px; object-fit: cover;">
                        <div>
                            <h6 class="mb-1">${item.name}</h6>
                            <p class="text-muted mb-0 small">Código: ${item.id}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="input-group" style="width: 120px;">
                        <button class="btn btn-outline-secondary btn-sm quantity-minus" 
                                type="button"
                                data-product-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" 
                               class="form-control form-control-sm text-center cart-quantity"
                               value="${item.quantity}"
                               min="1"
                               data-product-id="${item.id}">
                        <button class="btn btn-outline-secondary btn-sm quantity-plus"
                                type="button"
                                data-product-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="text-end">${Utils.formatCurrency(item.price)}</td>
                <td class="text-end fw-bold">${Utils.formatCurrency(subtotal)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger remove-item"
                            data-product-id="${item.id}"
                            title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    renderCheckoutSummary(items) {
        const container = document.getElementById('checkoutSummary');
        if (!container) return;
        
        const itemsHTML = items.map(item => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="fw-medium">${item.name}</span>
                    <small class="text-muted d-block">x${item.quantity}</small>
                </div>
                <span>${Utils.formatCurrency(item.price * item.quantity)}</span>
            </li>
        `).join('');
        
        const subtotal = cart.getTotal();
        const deliveryFee = 1000; // Ejemplo fijo
        const total = subtotal + deliveryFee;
        
        container.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h6 class="card-title mb-3">Resumen de compra</h6>
                    
                    <ul class="list-group list-group-flush mb-3">
                        ${itemsHTML}
                        
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Subtotal</span>
                            <span>${Utils.formatCurrency(subtotal)}</span>
                        </li>
                        
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Costo de envío</span>
                            <span>${Utils.formatCurrency(deliveryFee)}</span>
                        </li>
                        
                        <li class="list-group-item d-flex justify-content-between fw-bold fs-5">
                            <span>Total</span>
                            <span class="text-primary">${Utils.formatCurrency(total)}</span>
                        </li>
                    </ul>
                    
                    <button class="btn btn-primary w-100" id="confirmOrderBtn">
                        <i class="fas fa-check-circle me-2"></i>
                        Confirmar Pedido
                    </button>
                </div>
            </div>
        `;
        
        // Bindear evento de confirmación
        const confirmBtn = document.getElementById('confirmOrderBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.handleCheckout());
        }
    }

    updateCartItem(productId) {
        const pid = (typeof productId === 'string' && /^\\d+$/.test(productId)) ? Number(productId) : productId;
        const item = cart.getItems().find(item => item.id === pid);
        if (!item) return;

        // Actualizar subtotal en la fila
        const rowElem = document.querySelector(`[data-product-id="${pid}"]`);
        const row = rowElem ? rowElem.closest('tr') : null;
        if (row) {
            const subtotalCell = row.querySelector('td:nth-child(4)');
            if (subtotalCell) {
                subtotalCell.textContent = Utils.formatCurrency(item.price * item.quantity);
            }
        }
    }

    updateTotals() {
        const subtotalElement = document.getElementById('cartSubtotal');
        const totalElement = document.getElementById('cartTotal');
        
        if (subtotalElement) {
            subtotalElement.textContent = Utils.formatCurrency(cart.getTotal());
        }
        
        if (totalElement) {
            totalElement.textContent = Utils.formatCurrency(cart.getTotal());
        }
    }

    async handleCheckout() {
        const loading = Utils.showLoading();
        
        try {
            // Obtener datos del formulario
            // Obtener datos de dirección
            const street = document.getElementById('addressStreet')?.value || '';
            const number = document.getElementById('addressNumber')?.value || '';
            const commune = document.getElementById('addressCommune')?.value || '';
            const city = document.getElementById('addressCity')?.value || '';
            const instructions = document.getElementById('addressInstructions')?.value || '';
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';

            if (!street || !number || !commune || !city) {
                throw new Error('Por favor completa todos los campos de dirección');
            }

            // Calcular total
            const items = cart.getItems().map(item => ({
                product: item._id || item.id,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }));
            const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
            const deliveryFee = 2990;
            const total = subtotal + deliveryFee;

            // Preparar datos del pedido
            const orderData = {
                items,
                deliveryAddress: {
                    street,
                    number,
                    commune,
                    city,
                    instructions
                },
                paymentMethod,
                subtotal,
                deliveryFee,
                total,
                notes: document.getElementById('orderNotes')?.value || ''
            };
            
            // Crear pedido
            const response = await api.orders.create(orderData);
            
            // Limpiar carrito
            cart.clearCart();
            
            Utils.showToast('¡Pedido creado exitosamente!', 'success');
            
            // Obtener el ID del pedido de la respuesta
            const orderId = response?._id || response?.data?._id || response?.id;
            
            // Redirigir a confirmación
            setTimeout(() => {
                window.location.href = `B12_Confirmacion_Pedido.html?order=${orderId}`;
            }, 1500);
            
        } catch (error) {
            Utils.showToast(error.message || 'Error al procesar el pedido', 'error');
            console.error('Checkout error:', error);
        } finally {
            Utils.hideLoading(loading);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('B10_') || 
        window.location.pathname.includes('B11_')) {
        window.cartHandler = new CartHandler();
    }
});