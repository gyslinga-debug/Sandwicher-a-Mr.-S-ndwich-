const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');


const adminController = require('../controllers/admin.controller');

// Apply auth + admin middleware to all admin routes
router.use(verifyToken, verifyAdmin);

// Dashboard stats
router.get('/stats', adminController.getStats);

// Gráficos de ventas
router.get('/sales-by-day', adminController.getSalesByDay);
router.get('/sales-by-product', adminController.getSalesByProduct);

// Recent orders
router.get('/orders', adminController.getRecentOrders);

// Users list
router.get('/users', adminController.getUsers);

// Root (opcional)
router.get('/', (req, res) => {
  res.json({ message: 'admin root (protected)' });
});

module.exports = router;
