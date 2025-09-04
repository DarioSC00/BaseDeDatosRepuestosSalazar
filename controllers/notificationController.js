const Notification = require('../models/Notification');
const NotificationDetail = require('../models/NotificationDetail');

// Crear notificación
exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener todas las notificaciones de un usuario
exports.getUserNotifications = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const notifications = await Notification.find({ usuarioId }).sort({ fecha: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { leida: true }, { new: true });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Crear detalle de notificación
exports.createNotificationDetail = async (req, res) => {
  try {
    const detail = new NotificationDetail(req.body);
    await detail.save();
    res.status(201).json(detail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener detalles de una notificación
exports.getNotificationDetails = async (req, res) => {
  try {
    const { notificacionId } = req.params;
    const details = await NotificationDetail.find({ notificacionId });
    res.json(details);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
