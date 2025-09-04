const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  type_document: { 
    type: String, 
    required: true, 
    enum: ['CC', 'NIT', 'CE', 'TI', 'PAS'], // Ajusta según tus necesidades
    trim: true
  },
  document: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: 5,
    maxlength: 20,
    match: /^[0-9]+$/
  },
  full_name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  locations: { 
    type: String, 
    trim: true,
    maxlength: 100
  },
  phone: { 
    type: String, 
    required: [true, 'El teléfono es obligatorio'],
    unique: true,
    trim: true,
    match: [/^[0-9]{7,15}$/, 'El teléfono debe contener entre 7 y 15 dígitos']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula y número.'
    }
  },
  status: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  role: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Role', 
    required: true 
  }
});

module.exports = mongoose.model('User', UserSchema);
