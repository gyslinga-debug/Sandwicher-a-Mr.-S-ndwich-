const User = require('../models/User');
const Order = require('../models/order');
const Product = require('../models/product');

// Estadísticas generales para el dashboard
// Ventas por día
exports.getSalesByDay = async (req, res) => {
  try {
    // Obtener fecha de hace 10 días
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    // Agrupar ventas por día (solo últimos 10 días)
    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: tenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
          ventas: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(sales.map(s => ({ day: s._id, ventas: s.ventas })));
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo ventas por día', error: err });
  }
};

// Ventas por producto
exports.getSalesByProduct = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $unwind: "$items" },
      { $group: {
          _id: "$items.product",
          ventas: { $sum: "$items.quantity" }
        }
      },
      { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $project: {
          name: "$product.name",
          ventas: 1
        }
      },
      { $sort: { ventas: -1 } }
    ]);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo ventas por producto', error: err });
  }
};
exports.getStats = async (req, res) => {
  try {
    // Total de ventas y pedidos
    const salesAgg = await Order.aggregate([
      { $group: { _id: null, ventasTotales: { $sum: '$total' }, pedidosTotales: { $sum: 1 }, ticketPromedio: { $avg: '$total' } } }
    ]);
    const ventasTotales = salesAgg[0]?.ventasTotales || 0;
    const pedidosTotales = salesAgg[0]?.pedidosTotales || 0;
    const ticketPromedio = salesAgg[0]?.ticketPromedio || 0;

    // Usuarios que han realizado pedidos
    const usuariosConPedidos = await Order.distinct('user');
    const usuariosActivos = usuariosConPedidos.length;
    const usuariosTotales = await User.countDocuments();

    // Productos vendidos (sumar cantidades de items)
    const productosVendidosAgg = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', cantidad: { $sum: '$items.quantity' } } }
    ]);
    const productosTotales = productosVendidosAgg.reduce((acc, prod) => acc + prod.cantidad, 0);

    res.json({
      ventasTotales,
      pedidosTotales,
      usuariosTotales,
      usuariosActivos,
      productosTotales,
      ticketPromedio
    });
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo estadísticas', error: err });
  }
};

// Últimos pedidos
exports.getRecentOrders = async (req, res) => {
  try {
    // Solo pedidos realizados (puedes filtrar por estado si lo deseas)
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10).populate('user');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo pedidos', error: err });
  }
};

// Listado de usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo usuarios', error: err });
  }
};
