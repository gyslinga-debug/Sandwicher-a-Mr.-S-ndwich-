const Order = require('../models/order');
const User = require('../models/User');

// Crear pedido
exports.createOrder = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    if (!userId) return res.status(401).json({ message: 'Usuario no autenticado' });

    const { items, deliveryAddress, paymentMethod, total, subtotal, deliveryFee, discount, discountCode } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'No hay productos en el pedido' });

    // Generar número de pedido único
    const orderNumber = 'MRS-' + Math.floor(100000 + Math.random() * 900000);

    const order = new Order({
      orderNumber,
      user: userId,
      items,
      deliveryAddress,
      paymentMethod,
      total,
      subtotal: subtotal || items.reduce((acc, item) => acc + item.subtotal, 0),
      deliveryFee: deliveryFee || 2990,
      discount: discount || 0,
      discountCode: discountCode || '',
      paymentStatus: 'paid',
      status: 'pending',
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creando pedido:', err);
    res.status(500).json({ message: 'Error creando pedido', error: err.message });
  }
};

// Listar pedidos del usuario autenticado
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Usuario no autenticado' });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo pedidos', error: err });
  }
};

// Listar todos los pedidos (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo pedidos', error: err });
  }
};

// Obtener pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Formatear los items para incluir el nombre del producto
    const formattedOrder = order.toObject();
    formattedOrder.items = formattedOrder.items.map(item => ({
      ...item,
      name: item.product?.name || 'Producto',
      price: item.price,
      quantity: item.quantity
    }));
    
    res.json(formattedOrder);
  } catch (err) {
    console.error('Error obteniendo pedido:', err);
    res.status(500).json({ message: 'Error obteniendo pedido', error: err.message });
  }
};

// Cancelar pedido
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar que el pedido pertenezca al usuario
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para cancelar este pedido' });
    }

    // Verificar que el pedido esté en un estado cancelable
    const cancellableStatuses = ['pending', 'confirmed', 'preparing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        message: `No se puede cancelar un pedido en estado ${order.status}. Solo se pueden cancelar pedidos pendientes, confirmados o en preparación.` 
      });
    }

    // Actualizar el pedido
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Sin motivo especificado';
    
    await order.save();

    res.json({ 
      message: 'Pedido cancelado exitosamente',
      order 
    });
  } catch (err) {
    console.error('Error cancelando pedido:', err);
    res.status(500).json({ message: 'Error cancelando pedido', error: err.message });
  }
};

// Actualizar estado del pedido (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validar que el estado sea válido
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Actualizar el estado
    order.status = status;
    
    // Si se marca como entregado, registrar la fecha
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    
    await order.save();

    res.json({ 
      message: 'Estado actualizado exitosamente',
      order 
    });
  } catch (err) {
    console.error('Error actualizando estado:', err);
    res.status(500).json({ message: 'Error actualizando estado del pedido', error: err.message });
  }
};
