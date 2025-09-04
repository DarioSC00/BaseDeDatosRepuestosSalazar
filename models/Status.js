const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/ // Solo letras y espacios, ajusta si necesitas otros caracteres
  }
});

module.exports = mongoose.model('Status', StatusSchema);
