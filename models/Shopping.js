const mongoose = require('mongoose');

const shoppingSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    maxlength: 30
  },
  total_value: {
    type: Number,
    required: true,
    min: 0
  },
  observations: {
    type: String,
    maxlength: 300
  },
  notes: {
    type: String,
    maxlength: 300
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // NO pongas default aquí
  },
  details: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 1
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Shopping', shoppingSchema);
