const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function createTestUser() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/mr-sandwich');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un usuario
    const existingUser = await User.findOne({ email: 'test@test.com' });
    if (existingUser) {
      console.log('✅ Usuario de prueba ya existe:', existingUser.email);
      console.log('   Rol:', existingUser.role);
      process.exit(0);
    }

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const testUser = new User({
      name: 'Usuario Test',
      email: 'test@test.com',
      password: hashedPassword,
      phone: '912345678',
      role: 'user'
    });

    await testUser.save();
    console.log('✅ Usuario de prueba creado:');
    console.log('   Email: test@test.com');
    console.log('   Password: 123456');
    console.log('   Rol:', testUser.role);

    // Crear usuario admin si no existe
    const existingAdmin = await User.findOne({ email: 'admin@mrsandwich.cl' });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = new User({
        name: 'Administrador',
        email: 'admin@mrsandwich.cl',
        password: hashedAdminPassword,
        phone: '987654321',
        role: 'admin'
      });

      await adminUser.save();
      console.log('✅ Usuario admin creado:');
      console.log('   Email: admin@mrsandwich.cl');
      console.log('   Password: admin123');
      console.log('   Rol:', adminUser.role);
    } else {
      console.log('✅ Usuario admin ya existe:', existingAdmin.email);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
