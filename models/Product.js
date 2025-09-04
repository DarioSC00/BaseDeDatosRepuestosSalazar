const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[A-Za-z0-9\-_.]+$/
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  size: {
    type: String,
    trim: true,
    maxlength: 30,
    default: null // opcional
  },
  quantity: {
    type: Number,
    min: 1,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'El stock debe ser un número entero.'
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO'
  },
  expiration_date: {
    type: Date,
    default: null
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  price_purchase: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price_wholesale: {  // Precio para mayoristas (20% ganancia)
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price_retail: {     // Precio para clientes al detal (25% ganancia)
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  margin_wholesale: {
    type: Number,
    default: 20,      // 20% para mayoristas
    min: 0,
    max: 100
  },
  margin_retail: {
    type: Number,
    default: 25,      // 25% para clientes al detal
    min: 0,
    max: 100
  }
});

module.exports = mongoose.model('Product', ProductSchema);
