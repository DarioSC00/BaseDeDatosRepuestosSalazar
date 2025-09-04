const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/ // Solo letras y espacios
  },
  description: {
  type: String,
  trim: true,
  maxlength: 250,
  default: ''
  },
  permissions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Permission' 
  }],
  status: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', RoleSchema);
