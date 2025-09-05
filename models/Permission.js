const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s_]+$/ // Letras, espacios y guiones bajos
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Permission', PermissionSchema);
