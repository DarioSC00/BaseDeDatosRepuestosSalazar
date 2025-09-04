const mongoose = require('mongoose');

const DashboardDetailSchema = new mongoose.Schema({
  period: { type: String, required: true }, // Ej: "2025-08" o "2025-08-11"
  type: { type: String, enum: ['daily', 'monthly', 'yearly'], required: true },
  total_sales: { type: Number, default: 0 },
  total_purchases: { type: Number, default: 0 },
  total_profit: { type: Number, default: 0 },
  top_products: [{ name: String, quantity: Number }],
  least_sold_products: [{ name: String, quantity: Number }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DashboardDetail', DashboardDetailSchema);
