const mongoose = require('mongoose');

const NotificationDetailSchema = new mongoose.Schema({
  datosExtra: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, required: true }, // venta, compra, stock, cliente, etc.
  mensaje: { type: String, required: true },
  entidadId: { type: mongoose.Schema.Types.ObjectId, required: false }, // id de la entidad relacionada
  leida: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now },
  detalle: NotificationDetailSchema
});

module.exports = mongoose.model('Notification', NotificationSchema);
