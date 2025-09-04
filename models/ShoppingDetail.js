const mongoose = require('mongoose');

const ShoppingDetailSchema = new mongoose.Schema({
  shopping: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopping', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  count: { type: Number, required: true }, // cantidad comprada
  unit_price: { type: Number, required: true }, // precio de compra unitario
  sale_price: { type: Number, required: true }, // precio de venta unitario
  total_price: { type: Number }, // opcional: cantidad * precio de compra
}, {
  timestamps: true
});

module.exports = mongoose.model('ShoppingDetail', ShoppingDetailSchema);
