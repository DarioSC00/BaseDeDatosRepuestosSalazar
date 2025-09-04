const Status = require('../models/Status');

// Crear un nuevo estado
exports.createStatus = async (req, res) => {
  try {
    const status = new Status(req.body);
    await status.save();
    res.status(201).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los estados
exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un estado por ID
exports.getStatusById = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: 'Estado no encontrado' });
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un estado
exports.updateStatus = async (req, res) => {
  try {
    const status = await Status.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!status) return res.status(404).json({ error: 'Estado no encontrado' });
    res.json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un estado
exports.deleteStatus = async (req, res) => {
  try {
    const status = await Status.findByIdAndDelete(req.params.id);
    if (!status) return res.status(404).json({ error: 'Estado no encontrado' });
    res.json({ message: 'Estado eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
