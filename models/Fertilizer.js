const mongoose = require('mongoose');

const FertilizerSchema = new mongoose.Schema({
  valor: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false
  },
  observaciones: {
    type: String,
    maxlength: 500,
    trim: true
  },
  tipo: {
    type: String,
    enum: ['fertilizer', 'abono_cupo', 'otros'],
    default: 'fertilizer'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  sales: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }
});

module.exports = mongoose.model('Fertilizer', FertilizerSchema);
