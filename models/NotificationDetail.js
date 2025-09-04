const mongoose = require('mongoose');

const NotificationDetailSchema = new mongoose.Schema({
  notificacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
  datosExtra: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NotificationDetail', NotificationDetailSchema);
