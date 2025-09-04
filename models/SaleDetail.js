const mongoose = require('mongoose');

const SaleDetailSchema = new mongoose.Schema({
  count: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true, min: 0 },
  total_price: { type: Number, required: true, min: 0 },
  sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

module.exports = mongoose.model('SaleDetail', SaleDetailSchema);
