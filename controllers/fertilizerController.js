const Fertilizer = require('../models/Fertilizer');

// Crear un nuevo fertilizante
exports.createFertilizer = async (req, res) => {
  try {
    const fertilizer = new Fertilizer(req.body);
    await fertilizer.save();
    res.status(201).json(fertilizer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los fertilizantes
exports.getFertilizers = async (req, res) => {
  try {
    const fertilizers = await Fertilizer.find().populate('sales');
    res.json(fertilizers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un fertilizante por ID
exports.getFertilizerById = async (req, res) => {
  try {
    const fertilizer = await Fertilizer.findById(req.params.id).populate('sales');
    if (!fertilizer) return res.status(404).json({ error: 'Fertilizante no encontrado' });
    res.json(fertilizer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un fertilizante
exports.updateFertilizer = async (req, res) => {
  try {
    const fertilizer = await Fertilizer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fertilizer) return res.status(404).json({ error: 'Fertilizante no encontrado' });
    res.json(fertilizer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un fertilizante
exports.deleteFertilizer = async (req, res) => {
  try {
    const fertilizer = await Fertilizer.findByIdAndDelete(req.params.id);
    if (!fertilizer) return res.status(404).json({ error: 'Fertilizante no encontrado' });
    res.json({ message: 'Fertilizante eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
