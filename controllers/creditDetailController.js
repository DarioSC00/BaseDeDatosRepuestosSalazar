const CreditDetail = require('../models/CreditDetail');

// Crear detalle de crédito
exports.createCreditDetail = async (req, res) => {
  try {
    const detail = new CreditDetail(req.body);
    await detail.save();
    res.status(201).json(detail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los detalles de crédito
exports.getAllCreditDetails = async (req, res) => {
  try {
    const details = await CreditDetail.find().populate('credit product');
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener detalles por crédito
exports.getCreditDetailsByCredit = async (req, res) => {
  try {
    const { creditId } = req.params;
    const details = await CreditDetail.find({ credit: creditId }).populate('product');
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar detalle de crédito
exports.updateCreditDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CreditDetail.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar detalle de crédito
exports.deleteCreditDetail = async (req, res) => {
  try {
    const { id } = req.params;
    await CreditDetail.findByIdAndDelete(id);
    res.json({ message: 'Detalle eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
