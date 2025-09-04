const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/ // Solo letras y espacios (ajusta si necesitas otros caracteres)
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Permission', PermissionSchema);
