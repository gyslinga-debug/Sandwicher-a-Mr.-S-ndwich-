// Manejo del panel de administración
class AdminManager {
    constructor() {
        this.stats = {};
        this.orders = [];
        this.users = [];
        this.products = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAdminAccess();
        this.loadDashboardData();
    }

    bindEvents() {
        // Menú sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.admin-sidebar').classList.toggle('active');
            });
        }

        // Filtros de fecha
        const dateFilterBtn = document.getElementById('applyDateFilter');
        if (dateFilterBtn) {
            dateFilterBtn.addEventListener('click', () => this.applyDateFilter());
        }

        const clearDateFilterBtn = document.getElementById('clearDateFilter');
        if (clearDateFilterBtn) {
            clearDateFilterBtn.addEventListener('click', () => this.clearDateFilter());
        }

        // Actualizar estado de pedido
        document.addEventListener('click', (e) => {
            if (e.target.closest('.update-status')) {
                const button = e.target.closest('.update-status');
                const orderId = button.dataset.orderId;
                console.log('Clicked update status button, orderId:', orderId);
                console.log('Available orders:', this.orders);
                this.showStatusModal(orderId);
            }
        });

        // Procesar pago en caja virtual
        const processPaymentBtn = document.getElementById('processPayment');
        if (processPaymentBtn) {
            processPaymentBtn.addEventListener('click', () => this.processPayment());
        }
    }

    checkAdminAccess() {
        const user = auth.getUser();
        
        if (!user || user.role !== 'admin') {
            Utils.showToast('Acceso denegado. Se requiere rol de administrador.', 'error');
            setTimeout(() => {
                window.location.href = 'B00_Index.html';
            }, 2000);
            return false;
        }
        
        return true;
    }

    async loadDashboardData() {
        if (!this.checkAdminAccess()) return;
        
        const loading = Utils.showLoading();
        
        try {
            // Cargar estadísticas y datos para gráficos
            const [statsRes, ordersRes, usersRes, salesByDayRes, salesByProductRes] = await Promise.all([
                api.admin.getStats(),
                api.admin.getRecentOrders(),
                api.admin.getUsers(),
                api.admin.getSalesByDay(),
                api.admin.getSalesByProduct()
            ]);

            this.stats = statsRes.data || statsRes;
            this.orders = ordersRes.data || ordersRes;
            this.users = usersRes.data || usersRes;
            this.salesByDay = salesByDayRes;
            this.salesByProduct = salesByProductRes;

            // Renderizar según la página actual
            if (window.location.pathname.includes('B16_Dashboard')) {
                this.renderDashboard();
            }

            if (window.location.pathname.includes('B17_Graficos_Ventas')) {
                this.renderCharts();
            }

            if (window.location.pathname.includes('B19_Ordenes_Despacho')) {
                this.renderOrdersTable();
            }

            if (window.location.pathname.includes('B18_Filtros_Fechas')) {
                this.renderFilteredOrders();
            }

            if (window.location.pathname.includes('B13_Caja_Virtual')) {
                this.initCashRegister();
            }

        } catch (error) {
            Utils.showToast('Error al cargar datos del dashboard', 'error');
            console.error('Dashboard error:', error);
        } finally {
            Utils.hideLoading(loading);
        }
    }

    renderDashboard() {
        // Renderizar estadísticas
        this.renderStats();
        
        // Renderizar órdenes recientes
        this.renderRecentOrders();
    }

    renderStats() {
        const statsContainer = document.getElementById('adminStats');
        if (!statsContainer) return;
        
        const stats = this.stats || {};
        
        statsContainer.innerHTML = `
            <div class="row g-3">
                <div class="col-md-4"><div class="card shadow-sm"><div class="card-body text-center"><div class="h6">Ventas totales</div><div class="display-6">${Utils.formatCurrency(stats.ventasTotales || 0)}</div></div></div></div>
                <div class="col-md-4"><div class="card shadow-sm"><div class="card-body text-center"><div class="h6">Pedidos</div><div class="display-6">${stats.pedidosTotales || 0}</div></div></div></div>
                <div class="col-md-4"><div class="card shadow-sm"><div class="card-body text-center"><div class="h6">Usuarios activos</div><div class="display-6">${stats.usuariosActivos || 0}</div></div></div></div>
            </div>
        `;
    }

    renderRecentOrders() {
        const container = document.getElementById('recentOrders');
        if (!container) return;
        
        const orders = this.orders.slice(0, 5); // Mostrar solo 5 recientes
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted">No hay pedidos recientes</p>
                </div>
            `;
            return;
        }
        
        const ordersHTML = orders.map(order => `
            <tr>
                <td>${order.orderNumber || order._id}</td>
                <td>${order.user?.name || 'Sin nombre'}</td>
                <td>${Utils.formatCurrency(order.total || 0)}</td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
        
        container.innerHTML = ordersHTML;
    }

    renderCharts() {
        // Usar datos reales obtenidos del backend
        this.renderLineChart(this.salesByDay || []);
        this.renderPieChart(this.salesByProduct || []);
    }

    renderLineChart(data) {
        const canvas = document.getElementById('salesChart');
        if (!canvas || !window.Chart) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.day),
                datasets: [{
                    label: 'Ventas por día',
                    data: data.map(d => d.ventas),
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Ventas: ${Utils.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    renderPieChart(data) {
        const canvas = document.getElementById('productsChart');
        if (!canvas || !window.Chart) return;
        
        const ctx = canvas.getContext('2d');
        // Colores distintos y vibrantes para hasta 9 productos
        const colors = [
            '#FF6384',  // Rosa/Rojo
            '#36A2EB',  // Azul
            '#FFCE56',  // Amarillo
            '#4BC0C0',  // Turquesa
            '#9966FF',  // Púrpura
            '#FF9F40',  // Naranja
            '#FF6384',  // Rosa fuerte
            '#C9CBCF',  // Gris
            '#4BC0C0'   // Verde agua
        ];
        
        // Destruir gráfico anterior si existe
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        canvas.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    data: data.map(d => d.ventas),
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                },
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'center'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} ventas (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderOrdersTable() {
        const container = document.getElementById('dispatchOrders');
        if (!container) return;
        
        // Filtrar órdenes pendientes o en preparación
        const dispatchOrders = this.orders.filter(order => 
            order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready'
        );
        
        if (dispatchOrders.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <p class="text-muted">No hay órdenes para despachar</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        const ordersHTML = dispatchOrders.map(order => `
            <tr>
                <td>#${order.orderNumber || order.id}</td>
                <td>${order.user?.name || 'Cliente'}</td>
                <td>${this.getStatusBadge(order.status)}</td>
                <td>${this.formatAddress(order.deliveryAddress)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a href="B20_Estado_Entrega.html?id=${order._id || order.id}" 
                           class="btn btn-outline-primary">
                            <i class="fas fa-eye me-1"></i> Ver
                        </a>
                        <button class="btn btn-outline-info update-status"
                                data-order-id="${order._id || order.id}">
                            <i class="fas fa-edit me-1"></i> Estado
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        container.innerHTML = ordersHTML;
    }

    initCashRegister() {
        // Inicializar valores por defecto
        const amountInput = document.getElementById('paymentAmount');
        if (amountInput) {
            // Establecer monto del carrito si está disponible
            const cartTotal = cart.getTotal();
            if (cartTotal > 0) {
                amountInput.value = Utils.formatCurrency(cartTotal);
            }
        }
    }

    async applyDateFilter() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            Utils.showToast('Selecciona ambas fechas', 'warning');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            Utils.showToast('La fecha de inicio debe ser anterior a la fecha final', 'warning');
            return;
        }
        
        const loading = Utils.showLoading();
        
        try {
            const response = await api.admin.getSalesReport(startDate, endDate);
            this.renderFilteredResults(response.data || response);
        } catch (error) {
            Utils.showToast('Error al filtrar resultados', 'error');
            console.error('Filter error:', error);
        } finally {
            Utils.hideLoading(loading);
        }
    }

    renderFilteredResults(data) {
        const container = document.getElementById('filteredResults');
        if (!container) return;
        
        const orders = data.orders || [];
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    No se encontraron pedidos en el rango de fechas seleccionado.
                </div>
            `;
            return;
        }
        
        const ordersHTML = orders.map(order => `
            <tr>
                <td>#${order.orderNumber || order.id}</td>
                <td>${Utils.formatDate(order.createdAt || order.date)}</td>
                <td>${order.user?.name || 'Cliente'}</td>
                <td>${Utils.formatCurrency(order.total || order.amount)}</td>
            </tr>
        `).join('');
        
        container.innerHTML = ordersHTML;
        
        // Mostrar resumen
        const summary = document.getElementById('filterSummary');
        if (summary) {
            summary.innerHTML = `
                <div class="alert alert-success">
                    <strong>Resumen del período:</strong><br>
                    Pedidos encontrados: ${orders.length}<br>
                    Ventas totales: ${Utils.formatCurrency(data.totalSales || 0)}<br>
                    Promedio por pedido: ${Utils.formatCurrency(data.averageOrder || 0)}
                </div>
            `;
        }
    }

    showStatusModal(orderId) {
        console.log('showStatusModal called with orderId:', orderId);
        console.log('this.orders:', this.orders);
        
        const order = this.orders.find(o => o._id === orderId || o.id === orderId);
        console.log('Found order:', order);
        
        if (!order) {
            console.error('Order not found with id:', orderId);
            Utils.showToast('No se pudo encontrar el pedido', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem;';
        modal.innerHTML = `
            <div class="admin-modal-content" style="background: white; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div class="admin-modal-header" style="padding: 1.5rem; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">Actualizar Estado del Pedido</h3>
                    <button class="close-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">&times;</button>
                </div>
                <div class="admin-modal-body" style="padding: 1.5rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>Pedido:</strong> #${order.orderNumber || order._id?.slice(-6).toUpperCase()}</p>
                    <p style="margin-bottom: 1rem;"><strong>Cliente:</strong> ${order.user?.name || 'Cliente'}</p>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Estado actual:</label>
                        <div>
                            ${this.getStatusBadge(order.status)}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Nuevo estado:</label>
                        <select class="status-select-field" style="width: 100%; padding: 0.5rem; border: 1px solid #dee2e6; border-radius: 4px; font-size: 1rem;">
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>
                                Confirmado
                            </option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>
                                En preparación
                            </option>
                            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>
                                Listo para entrega
                            </option>
                            <option value="in_transit" ${order.status === 'in_transit' ? 'selected' : ''}>
                                En camino
                            </option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>
                                Entregado
                            </option>
                        </select>
                    </div>
                </div>
                <div class="admin-modal-footer" style="padding: 1.5rem; border-top: 1px solid #dee2e6; display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <button class="btn btn-secondary cancel-update-btn" style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #6c757d; background: white; color: #6c757d; cursor: pointer;">Cancelar</button>
                    <button class="btn btn-primary save-status-btn" style="padding: 0.5rem 1rem; border-radius: 4px; border: none; background: var(--brand-brown); color: white; cursor: pointer;">Guardar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-update-btn').addEventListener('click', () => modal.remove());
        
        modal.querySelector('.save-status-btn').addEventListener('click', async () => {
            const newStatus = modal.querySelector('.status-select-field').value;
            await this.updateOrderStatus(orderId, newStatus);
            modal.remove();
        });
    }

    async updateOrderStatus(orderId, status) {
        const loading = Utils.showLoading();
        
        try {
            await api.orders.updateStatus(orderId, status);
            
            // Actualizar localmente
            const orderIndex = this.orders.findIndex(order => 
                order._id === orderId || order.id === orderId
            );
            
            if (orderIndex !== -1) {
                this.orders[orderIndex].status = status;
            }
            
            Utils.showToast('Estado actualizado exitosamente', 'success');
            
            // Recargar la tabla
            setTimeout(() => {
                this.renderOrdersTable();
            }, 1000);
            
        } catch (error) {
            Utils.showToast(error.message || 'Error al actualizar estado', 'error');
            console.error('Update status error:', error);
        } finally {
            Utils.hideLoading(loading);
        }
    }

    async processPayment() {
        const amount = document.getElementById('paymentAmount').value;
        const method = document.getElementById('paymentMethod').value;
        
        if (!amount) {
            Utils.showToast('Ingresa un monto válido', 'warning');
            return;
        }
        
        const loading = Utils.showLoading();
        
        try {
            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            Utils.showToast(`Pago de ${amount} procesado exitosamente por ${method}`, 'success');
            
            // Limpiar formulario
            document.getElementById('paymentAmount').value = '';
            
        } catch (error) {
            Utils.showToast('Error al procesar el pago', 'error');
            console.error('Payment error:', error);
        } finally {
            Utils.hideLoading(loading);
        }
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

    renderFilteredOrders(filteredOrders = null) {
        const container = document.getElementById('filteredOrders');
        if (!container) return;

        const ordersToShow = filteredOrders || this.orders;

        if (ordersToShow.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <p class="text-muted">No se encontraron pedidos en el rango de fechas seleccionado</p>
                    </td>
                </tr>
            `;
            return;
        }

        const ordersHTML = ordersToShow.map(order => `
            <tr>
                <td>#${order.orderNumber || order._id}</td>
                <td>${Utils.formatDate(order.createdAt)}</td>
                <td>${Utils.formatCurrency(order.total)}</td>
                <td>${this.getStatusBadge(order.status)}</td>
            </tr>
        `).join('');

        container.innerHTML = ordersHTML;
    }

    applyDateFilter() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            Utils.showToast('Por favor selecciona ambas fechas', 'warning');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Incluir todo el día final

        const filtered = this.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
        });

        this.renderFilteredOrders(filtered);
        Utils.showToast(`${filtered.length} pedidos encontrados`, 'info');
    }

    clearDateFilter() {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        this.renderFilteredOrders();
    }
}
// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('B16_') || 
        window.location.pathname.includes('B17_') ||
        window.location.pathname.includes('B18_') ||
        window.location.pathname.includes('B19_') ||
        window.location.pathname.includes('B20_') ||
        window.location.pathname.includes('B21_') ||
        window.location.pathname.includes('B13_')) {
        
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            if (user.role === 'admin') {
                window.adminManager = new AdminManager();
            }
        }
    }
});