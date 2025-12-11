// Script para poblar productos de ejemplo en la base de datos
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const Product = require('../src/models/product');

const products = [
  {
    name: 'Sándwich Clásico',
    description: 'Pan fresco, jamón, queso y vegetales.',
    price: 8990,
    category: 'classics',
    ingredients: ['Pan', 'Jamón', 'Queso', 'Lechuga', 'Tomate'],
    imageUrl: '',
    stock: 50,
    isAvailable: true
  },
  {
    name: 'Pollo Crispy Italiano',
    description: 'Pollo crispy, tomate, palta y mayonesa.',
    price: 9990,
    category: 'pollo',
    ingredients: ['Pollo', 'Tomate', 'Palta', 'Mayonesa'],
    imageUrl: '',
    stock: 40,
    isAvailable: true
  },
  {
    name: 'Jamón Suizo',
    description: 'Jamón, queso suizo y mantequilla.',
    price: 8500,
    category: 'jamón',
    ingredients: ['Jamón', 'Queso Suizo', 'Mantequilla'],
    imageUrl: '',
    stock: 30,
    isAvailable: true
  },
  {
    name: 'Carne a la Parrilla',
    description: 'Carne de res a la parrilla, cebolla y salsa BBQ.',
    price: 11990,
    category: 'carne',
    ingredients: ['Carne', 'Cebolla', 'Salsa BBQ'],
    imageUrl: '',
    stock: 25,
    isAvailable: true
  },
  {
    name: 'Veggies Deluxe',
    description: 'Vegetales frescos y hummus.',
    price: 8990,
    category: 'vegano',
    ingredients: ['Lechuga', 'Tomate', 'Pepino', 'Hummus'],
    imageUrl: '',
    stock: 20,
    isAvailable: true
  },
  {
    name: 'Tostado Ranchero',
    description: 'Tostado con ingredientes rancheros.',
    price: 7990,
    category: 'especial',
    ingredients: ['Pan', 'Queso', 'Salsa Ranch'],
    imageUrl: '',
    stock: 15,
    isAvailable: true
  },
  {
    name: 'Mixto Premium',
    description: 'Sándwich mixto con ingredientes premium.',
    price: 12990,
    category: 'premium',
    ingredients: ['Jamón', 'Queso', 'Carne', 'Vegetales'],
    imageUrl: '',
    stock: 10,
    isAvailable: true
  },
  {
    name: 'Club Sándwich',
    description: 'Club sándwich clásico.',
    price: 10990,
    category: 'club',
    ingredients: ['Pollo', 'Tocino', 'Lechuga', 'Tomate'],
    imageUrl: '',
    stock: 12,
    isAvailable: true
  },
  {
    name: 'Emparedado Doble',
    description: 'Emparedado doble con extra de todo.',
    price: 13990,
    category: 'doble',
    ingredients: ['Pan', 'Carne', 'Queso', 'Vegetales', 'Salsas'],
    imageUrl: '',
    stock: 8,
    isAvailable: true
  },
  {
    name: 'Coca-Cola',
    description: 'Bebida gaseosa refrescante de 500ml.',
    price: 1990,
    category: 'bebida',
    ingredients: ['Agua carbonatada', 'Azúcar', 'Cafeína'],
    imageUrl: '',
    stock: 100,
    isAvailable: true
  },
  {
    name: 'Sprite',
    description: 'Bebida gaseosa sabor lima-limón de 500ml.',
    price: 1990,
    category: 'bebida',
    ingredients: ['Agua carbonatada', 'Azúcar', 'Sabor natural'],
    imageUrl: '',
    stock: 100,
    isAvailable: true
  }
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/mr-sandwich', { useNewUrlParser: true, useUnifiedTopology: true });
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Productos de ejemplo insertados');
  mongoose.disconnect();
}

seed();
