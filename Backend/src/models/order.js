const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  deliveryAddress: {
    street: { type: String, required: true },
    number: { type: String, required: true },
    commune: { type: String, required: true },
    city: { type: String, required: true },
    instructions: { type: String, default: '' }
  },
  paymentMethod: { type: String, required: true },
  total: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 2990 },
  discount: { type: Number, default: 0 },
  discountCode: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
