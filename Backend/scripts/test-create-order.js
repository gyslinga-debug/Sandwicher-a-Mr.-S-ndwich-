const mongoose = require('mongoose');
const Order = require('../src/models/order');
const User = require('../src/models/User');
const Product = require('../src/models/product');

async function testCreateOrder() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/mr-sandwich');
    console.log('✅ Conectado a MongoDB');

    // Buscar usuarios
    const users = await User.find();
    if (users.length === 0) {
      console.error('❌ No se encontró ningún usuario. Crea uno primero.');
      process.exit(1);
    }
    console.log('✅ Usuarios encontrados:', users.length);

    // Buscar productos
    const products = await Product.find();
    if (products.length === 0) {
      console.error('❌ No se encontraron productos. Ejecuta seed-products.js primero.');
      process.exit(1);
    }
    console.log(`✅ Productos encontrados: ${products.length}`);

    // Crear 5 pedidos de prueba con diferentes estados y fechas
    const statuses = ['pending', 'preparing', 'ready', 'delivered', 'confirmed'];
    const addresses = [
      { street: 'Av. Principal', number: '1234', commune: 'Santiago', city: 'Santiago', instructions: 'Timbre 3B' },
      { street: 'Calle Los Robles', number: '567', commune: 'Providencia', city: 'Santiago', instructions: 'Casa amarilla' },
      { street: 'Pasaje El Bosque', number: '89', commune: 'Las Condes', city: 'Santiago', instructions: 'Depto 402' },
      { street: 'Av. Libertador', number: '2345', commune: 'Vitacura', city: 'Santiago', instructions: 'Portería' },
      { street: 'Calle Nueva', number: '111', commune: 'Ñuñoa', city: 'Santiago', instructions: 'Casa con reja verde' }
    ];

    const createdOrders = [];

    for (let i = 0; i < 5; i++) {
      const orderNumber = 'MRS-' + Math.floor(100000 + Math.random() * 900000);
      const user = users[i % users.length];
      const numProducts = Math.floor(Math.random() * 3) + 1; // 1-3 productos
      const selectedProducts = [];
      
      for (let j = 0; j < numProducts; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        selectedProducts.push(randomProduct);
      }

      const items = selectedProducts.map(p => ({
        product: p._id,
        quantity: Math.floor(Math.random() * 3) + 1, // 1-3 unidades
        price: p.price,
        subtotal: p.price * (Math.floor(Math.random() * 3) + 1)
      }));

      const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
      const deliveryFee = 2990;
      
      const orderData = {
        orderNumber,
        user: user._id,
        items,
        deliveryAddress: addresses[i],
        paymentMethod: i % 2 === 0 ? 'cash' : 'card',
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        paymentStatus: 'paid',
        status: statuses[i]
      };

      // Variar fechas (últimos 7 días)
      const daysAgo = Math.floor(Math.random() * 7);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const order = new Order(orderData);
      order.createdAt = createdAt;
      await order.save();
      
      createdOrders.push(order);
      console.log(`✅ Pedido ${i + 1}/5 creado: ${order.orderNumber} - ${order.status} - $${order.total}`);
    }

    console.log('\n✅ Todos los pedidos creados exitosamente');
    console.log(`   Total de pedidos: ${createdOrders.length}`);
    console.log(`   Valor total: $${createdOrders.reduce((acc, o) => acc + o.total, 0)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCreateOrder();
