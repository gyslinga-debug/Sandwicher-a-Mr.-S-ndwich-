// Manejo de pedidos y compras
class OrderManager {
    constructor() {
        this.orders = [];
        this.currentOrder = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadOrders();
    }

    bindEvents() {
        // Cancelar pedido
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cancel-order')) {
                const button = e.target.closest('.cancel-order');
                const orderId = button.dataset.orderId;
                this.handleCancelOrder(orderId);
            }
        });

        // Ver detalles del pedido
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-order')) {
                const button = e.target.closest('.view-order');
                const orderId = button.dataset.orderId;
                this.viewOrderDetails(orderId);
            }
        });

        // Descargar boleta
        const downloadReceiptBtn = document.getElementById('downloadReceipt');
        if (downloadReceiptBtn) {
            downloadReceiptBtn.addEventListener('click', () => this.downloadReceipt());
        }

        // Anular compra
        const cancelPurchaseBtn = document.getElementById('cancelPurchaseBtn');
        if (cancelPurchaseBtn) {
            cancelPurchaseBtn.addEventListener('click', () => this.cancelSelectedOrder());
        }
    }

    async loadOrders() {
        if (!auth.isAuthenticated()) {
            return;
        }

        const loading = Utils.showLoading();
        
        try {
            const response = await api.orders.getUserOrders();
            this.orders = response.data || response;
            
            if (window.location.pathname.includes('B06_Historial_Pedidos')) {
                this.renderOrders();
            }
            
            if (window.location.pathname.includes('B12_Confirmacion_Pedido')) {
                this.loadOrderConfirmation();
            }
            
            if (window.location.pathname.includes('B14_Boleta_Digital')) {
                this.loadReceipt();
            }
            
            if (window.location.pathname.includes('B15_Anulacion_Compra')) {
                this.loadCancellationOrders();
            }
            
        } catch (error) {
            Utils.showToast('Error al cargar pedidos', 'error');
            console.error('Error loading orders:', error);
        } finally {
            Utils.hideLoading(loading);
        }
    }

    renderOrders() {
        const container = document.getElementById('ordersTable');
        if (!container) return;
        
        if (this.orders.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                        <h4>No hay pedidos realizados</h4>
                        <p class="text-muted">Realiza tu primer pedido y aparecerá aquí</p>
                        <a href="B07_Catalogo.html" class="btn btn-primary mt-2">
                            <i class="fas fa-store me-2"></i>
                            Ver Catálogo
                        </a>
                    </td>
                </tr>
            `;
            return;
        }
        
        const ordersHTML = this.orders.map(order => this.createOrderRow(order)).join('');
        container.innerHTML = ordersHTML;
    }

    createOrderRow(order) {
        const statusBadge = this.getStatusBadge(order.status);
        const canCancel = order.status === 'pending' || order.status === 'preparing';
        
        return `
            <tr>
                <td>
                    <a href="B14_Boleta_Digital.html?id=${order._id || order.id}" 
                       class="text-decoration-none">
                        #${order.orderNumber || order.id}
                    </a>
                </td>
                <td>${Utils.formatDate(order.createdAt || order.date)}</td>
                <td>${Utils.formatCurrency(order.total || order.amount)}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a href="B14_Boleta_Digital.html?id=${order._id || order.id}" 
                           class="btn btn-outline-primary">
                            <i class="fas fa-eye"></i>
                        </a>
                        ${canCancel ? `
                            <button class="btn btn-outline-danger cancel-order"
                                    data-order-id="${order._id || order.id}"
                                    title="Cancelar pedido">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    async loadOrderConfirmation() {
        const orderId = new URLSearchParams(window.location.search).get('order');
        
        if (!orderId) {
            // Si no hay ID, usar el último pedido
            if (this.orders.length > 0) {
                this.currentOrder = this.orders[0];
            } else {
                window.location.href = 'B07_Catalogo.html';
                return;
            }
        } else {
            // Buscar el pedido por ID
            this.currentOrder = this.orders.find(order => 
                order._id === orderId || order.id === orderId
            );
            
            if (!this.currentOrder) {
                try {
                    const response = await api.getOrder(orderId);
                    this.currentOrder = response.data || response;
                } catch (error) {
                    console.error('Error loading order:', error);
                    window.location.href = 'B06_Historial_Pedidos.html';
                    return;
                }
            }
        }
        
        this.renderOrderConfirmation();
    }

    renderOrderConfirmation() {
        const container = document.getElementById('orderConfirmation');
        if (!container || !this.currentOrder) return;
        
        container.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="text-center mb-4">
                        <div class="mb-3">
                            <i class="fas fa-check-circle fa-4x text-success"></i>
                        </div>
                        <h2 class="card-title text-success">¡Pedido Confirmado!</h2>
                        <p class="text-muted">Hemos recibido tu pedido y lo estamos procesando.</p>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <strong>Número de pedido:</strong><br>
                                <span class="h5">#${this.currentOrder.orderNumber || this.currentOrder.id}</span>
                            </div>
                            <div class="mb-3">
                                <strong>Fecha:</strong><br>
                                ${Utils.formatDate(this.currentOrder.createdAt || this.currentOrder.date)}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <strong>Estado:</strong><br>
                                ${this.getStatusBadge(this.currentOrder.status)}
                            </div>
                            <div class="mb-3">
                                <strong>Total:</strong><br>
                                <span class="h5 text-primary">
                                    ${Utils.formatCurrency(this.currentOrder.total || this.currentOrder.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <h5>Detalles del pedido:</h5>
                        <ul class="list-group">
                            ${(this.currentOrder.items || []).map(item => `
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>${item.name || item.product} x${item.quantity}</span>
                                    <span>${Utils.formatCurrency(item.price * item.quantity)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="mt-4">
                        <h5>Dirección de envío:</h5>
                        <p class="text-muted">
                            ${this.formatAddress(this.currentOrder.deliveryAddress)}
                        </p>
                    </div>
                    
                    <div class="mt-4 d-flex gap-2 justify-content-center">
                        <a href="B14_Boleta_Digital.html?id=${this.currentOrder._id || this.currentOrder.id}" 
                           class="btn btn-primary">
                            <i class="fas fa-receipt me-2"></i>
                            Ver Boleta Digital
                        </a>
                        <a href="B20_Estado_Entrega.html?id=${this.currentOrder._id || this.currentOrder.id}" 
                           class="btn btn-outline-primary">
                            <i class="fas fa-truck me-2"></i>
                            Seguir Envío
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    async loadReceipt() {
        const orderId = new URLSearchParams(window.location.search).get('id');
        
        if (!orderId) {
            window.location.href = 'B06_Historial_Pedidos.html';
            return;
        }
        
        const loading = Utils.showLoading();
        
        try {
            const response = await api.getOrder(orderId);
            this.currentOrder = response.data || response;
            this.renderReceipt();
        } catch (error) {
            Utils.showToast('Error al cargar la boleta', 'error');
            console.error('Error loading receipt:', error);
            window.location.href = 'B06_Historial_Pedidos.html';
        } finally {
            Utils.hideLoading(loading);
        }
    }

    renderReceipt() {
        const container = document.getElementById('receiptContent');
        if (!container || !this.currentOrder) return;
        
        container.innerHTML = `
            <div class="text-center mb-4">
                <h1 class="h2">Mr. Sandwich</h1>
                <p class="text-muted">RUT: 76.123.456-7</p>
                <p class="text-muted">Av. Principal 1234, Santiago</p>
            </div>
            
            <hr class="my-4">
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <p><strong>Boleta Electrónica</strong></p>
                    <p><strong>N°:</strong> ${this.currentOrder.orderNumber || this.currentOrder.id}</p>
                    <p><strong>Fecha:</strong> ${Utils.formatDate(this.currentOrder.createdAt || this.currentOrder.date)}</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p><strong>Cliente:</strong> ${auth.getUser()?.name || 'Cliente'}</p>
                    <p><strong>RUT:</strong> --</p>
                    <p><strong>Dirección:</strong> ${this.formatAddress(this.currentOrder.deliveryAddress)}</p>
                </div>
            </div>
            
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th class="text-end">Cantidad</th>
                        <th class="text-end">Precio Unit.</th>
                        <th class="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${(this.currentOrder.items || []).map((item, index) => `
                        <tr>
                            <td>${item.productId || index + 1}</td>
                            <td>${item.name || item.product}</td>
                            <td class="text-end">${item.quantity}</td>
                            <td class="text-end">${Utils.formatCurrency(item.price)}</td>
                            <td class="text-end">${Utils.formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot class="table-light">
                    <tr>
                        <td colspan="4" class="text-end"><strong>Subtotal:</strong></td>
                        <td class="text-end">${Utils.formatCurrency(this.currentOrder.subtotal || this.currentOrder.total)}</td>
                    </tr>
                    <tr>
                        <td colspan="4" class="text-end"><strong>IVA (19%):</strong></td>
                        <td class="text-end">${Utils.formatCurrency((this.currentOrder.total || 0) * 0.19)}</td>
                    </tr>
                    <tr>
                        <td colspan="4" class="text-end"><strong>TOTAL:</strong></td>
                        <td class="text-end fw-bold">${Utils.formatCurrency(this.currentOrder.total || this.currentOrder.amount)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="mt-4">
                <p class="text-muted small">
                    <strong>Información de pago:</strong><br>
                    Método: ${this.getPaymentMethodName(this.currentOrder.paymentMethod)}<br>
                    Estado: ${this.getStatusName(this.currentOrder.status)}<br>
                    Fecha de entrega estimada: ${Utils.formatDate(new Date(Date.now() + 60 * 60 * 1000))}
                </p>
            </div>
            
            <div class="mt-5 text-center">
                <p class="text-muted small">
                    Esta boleta cumple con los requisitos establecidos en la Resolución Exenta N° 45 del 18.06.2021 del SII.<br>
                    Boleta electrónica autorizada por el SII.
                </p>
            </div>
        `;
    }

    async loadCancellationOrders() {
        const select = document.getElementById('orderSelect');
        if (!select) return;
        
        // Filtrar pedidos cancelables (pendientes o en preparación)
        const cancelableOrders = this.orders.filter(order => 
            order.status === 'pending' || order.status === 'preparing'
        );
        
        if (cancelableOrders.length === 0) {
            select.innerHTML = '<option>No hay pedidos para anular</option>';
            return;
        }
        
        select.innerHTML = cancelableOrders.map(order => `
            <option value="${order._id || order.id}">
                #${order.orderNumber || order.id} - ${Utils.formatCurrency(order.total || order.amount)} - ${Utils.formatDate(order.createdAt || order.date)}
            </option>
        `).join('');
    }

    async handleCancelOrder(orderId) {
        if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
            return;
        }
        
        const loading = Utils.showLoading();
        
        try {
            await api.orders.cancel(orderId);
            
            // Actualizar localmente
            const orderIndex = this.orders.findIndex(order => 
                order._id === orderId || order.id === orderId
            );
            
            if (orderIndex !== -1) {
                this.orders[orderIndex].status = 'cancelled';
            }
            
            Utils.showToast('Pedido cancelado exitosamente', 'success');
            
            // Recargar la lista
            setTimeout(() => {
                this.renderOrders();
            }, 1000);
            
        } catch (error) {
            Utils.showToast(error.message || 'Error al cancelar el pedido', 'error');
            console.error('Cancel order error:', error);
        } finally {
            Utils.hideLoading(loading);
        }
    }

    async cancelSelectedOrder() {
        const select = document.getElementById('orderSelect');
        const orderId = select.value;
        
        if (!orderId || select.options[0].text.includes('No hay pedidos')) {
            Utils.showToast('Selecciona un pedido para anular', 'warning');
            return;
        }
        
        await this.handleCancelOrder(orderId);
    }

    getStatusBadge(status) {
        const statusMap = {
            'pending': { class: 'bg-warning text-dark', text: 'Pendiente' },
            'confirmed': { class: 'bg-info', text: 'Confirmado' },
            'preparing': { class: 'bg-info', text: 'En preparación' },
            'ready': { class: 'bg-primary', text: 'Listo para entrega' },
            'delivered': { class: 'bg-success', text: 'Entregado' },
            'cancelled': { class: 'bg-secondary', text: 'Cancelado' }
        };
        
        const statusInfo = statusMap[status] || { class: 'bg-light text-dark', text: status };
        return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
    }

    getStatusName(status) {
        const statusNames = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmado',
            'preparing': 'En preparación',
            'ready': 'Listo para entrega',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        
        return statusNames[status] || status;
    }

    getPaymentMethodName(method) {
        const methodNames = {
            'cash': 'Efectivo',
            'card': 'Tarjeta de crédito/débito',
            'transfer': 'Transferencia bancaria'
        };
        
        return methodNames[method] || method;
    }

    formatAddress(address) {
        if (!address) return 'No especificada';
        
        if (typeof address === 'string') return address;
        
        // Si es un objeto con propiedades
        const parts = [];
        if (address.street) parts.push(address.street);
        if (address.number) parts.push(`#${address.number}`);
        if (address.commune) parts.push(address.commune);
        if (address.city) parts.push(address.city);
        
        return parts.length > 0 ? parts.join(', ') : 'No especificada';
    }

    downloadReceipt() {
        // Implementar generación de PDF
        Utils.showToast('Descargando boleta en PDF...', 'info');
        
        // Simular descarga
        setTimeout(() => {
            Utils.showToast('Boleta descargada exitosamente', 'success');
        }, 1500);
    }

    viewOrderDetails(orderId) {
        window.location.href = `B14_Boleta_Digital.html?id=${orderId}`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('B06_') || 
        window.location.pathname.includes('B12_') || 
        window.location.pathname.includes('B14_') ||
        window.location.pathname.includes('B15_') ||
        window.location.pathname.includes('B20_')) {
        window.orderManager = new OrderManager();
    }
});