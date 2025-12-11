const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mr-sandwich';

async function makeAdmin(email) {
  if (!email) {
    console.error('Uso: node make-admin.js <email>');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Usuario no encontrado:', email);
      process.exit(2);
    }
    user.role = 'admin';
    await user.save();
    console.log(`Usuario ${email} promovido a admin.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  }
}

if (require.main === module) {
  const email = process.argv[2];
  makeAdmin(email);
}

module.exports = makeAdmin;
