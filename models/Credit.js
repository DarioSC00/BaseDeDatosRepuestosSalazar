const mongoose = require('mongoose');

// Modelo simplificado para gestión de cupos de clientes
const CreditSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  cupo_asignado: {
    type: Number,
    required: true,
    min: 0,
    description: 'Cupo de crédito asignado al cliente'
  },
  cupo_utilizado: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Cantidad del cupo que está siendo utilizada actualmente'
  },
  fecha_asignacion: {
    type: Date,
    default: Date.now,
    description: 'Fecha en que se asignó o modificó el cupo'
  },
  asignado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    description: 'Usuario administrador que asignó el cupo'
  },
  observaciones: {
    type: String,
    maxlength: 500,
    trim: true,
    description: 'Observaciones sobre la asignación del cupo'
  },
  status: {
    type: String,
    enum: ['ACTIVO', 'SUSPENDIDO', 'INACTIVO'],
    default: 'ACTIVO',
    description: 'Estado del cupo del cliente'
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Índice único para evitar duplicados de cupo por cliente
CreditSchema.index({ client: 1 }, { unique: true });

// Método virtual para calcular cupo disponible
CreditSchema.virtual('cupo_disponible').get(function() {
  return this.cupo_asignado - this.cupo_utilizado;
});

// Middleware para actualizar updated_at
CreditSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Método para verificar si el cliente puede usar cierta cantidad de cupo
CreditSchema.methods.puedeUtilizarCupo = function(monto) {
  return this.cupo_disponible >= monto;
};

// Método para utilizar parte del cupo
CreditSchema.methods.utilizarCupo = function(monto) {
  if (this.puedeUtilizarCupo(monto)) {
    this.cupo_utilizado += monto;
    return true;
  }
  return false;
};

// Método para liberar cupo utilizado
CreditSchema.methods.liberarCupo = function(monto) {
  this.cupo_utilizado = Math.max(0, this.cupo_utilizado - monto);
};

module.exports = mongoose.models.Credit || mongoose.model('Credit', CreditSchema);
