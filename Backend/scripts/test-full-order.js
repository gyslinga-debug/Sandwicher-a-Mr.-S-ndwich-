const mongoose = require('mongoose');
const Order = require('../src/models/order');
const User = require('../src/models/User');
const Product = require('../src/models/product');

async function testFullOrder() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mr-sandwich');
    console.log('✅ Conectado a MongoDB');

    // Buscar usuario test
    const user = await User.findOne({ email: 'test@test.com' });
    if (!user) {
      console.error('❌ Usuario test@test.com no encontrado');
      process.exit(1);
    }

    // Buscar productos
    const products = await Product.find().limit(3);
    console.log(`✅ Productos encontrados: ${products.length}`);

    // Crear pedido simulando el checkout
    const orderNumber = 'MRS-' + Math.floor(100000 + Math.random() * 900000);
    
    const items = products.map((p, i) => ({
      product: p._id,
      quantity: i + 1,
      price: p.price,
      subtotal: p.price * (i + 1)
    }));

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const deliveryFee = 2990;
    
    const orderData = {
      orderNumber,
      user: user._id,
      items,
      deliveryAddress: {
        street: 'Calle Test',
        number: '123',
        commune: 'Santiago Centro',
        city: 'Santiago',
        instructions: 'Tocar el timbre 2 veces'
      },
      paymentMethod: 'cash',
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentStatus: 'paid',
      status: 'pending'
    };

    const order = new Order(orderData);
    await order.save();
    
    console.log('\n✅ PEDIDO CREADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════');
    console.log(`📦 Número de pedido: ${order.orderNumber}`);
    console.log(`🆔 ID: ${order._id}`);
    console.log(`👤 Usuario: ${user.email}`);
    console.log(`💰 Total: $${order.total.toLocaleString('es-CL')}`);
    console.log(`📍 Dirección: ${orderData.deliveryAddress.street} #${orderData.deliveryAddress.number}`);
    console.log(`📱 Productos: ${items.length}`);
    items.forEach((item, i) => {
      console.log(`   ${i + 1}. ${products[i].name} x${item.quantity} = $${item.subtotal.toLocaleString('es-CL')}`);
    });
    console.log('═══════════════════════════════════════');
    console.log(`\n🔗 Ver recibo: http://localhost:5000/B12_Confirmacion_Pedido.html?order=${order._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testFullOrder();
