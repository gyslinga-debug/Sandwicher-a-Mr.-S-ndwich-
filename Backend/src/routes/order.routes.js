const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

// Crear pedido (requiere autenticación)
router.post('/', verifyToken, orderController.createOrder);

// Listar pedidos del usuario autenticado
router.get('/my', verifyToken, orderController.getUserOrders);

// Obtener pedido por ID (sin autenticación para recibos)
router.get('/:id', orderController.getOrderById);

// Cancelar pedido (requiere autenticación)
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);

// Actualizar estado del pedido (admin)
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);

// Listar todos los pedidos (admin)
router.get('/', verifyToken, orderController.getAllOrders);

module.exports = router;
